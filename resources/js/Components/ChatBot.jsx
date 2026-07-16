import { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
    IoChatbubbleEllipses, 
    IoSend, 
    IoClose, 
    IoImageOutline, 
    IoExpandOutline, 
    IoContractOutline 
} from "react-icons/io5";
import { TbInfoCircle, TbRefresh } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { usePage } from "@inertiajs/react";

import { marked } from "marked";

// Configure marked options
marked.setOptions({
    breaks: true,
    gfm: true
});

const parseMarkdown = (text) => {
    if (!text) return "";
    try {
        return marked.parse(text);
    } catch (err) {
        console.error("Markdown parse error:", err);
        return text;
    }
};

const ChatBot = () => {
    const { auth } = usePage().props;

    // Strict Frontend Authorization Guard
    if (auth?.user?.role !== "admin") {
        return null;
    }

    const [open, setOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFormat, setShowFormat] = useState(false);
    const storageKey = useMemo(() => `chatbot-history:${auth?.user?.id ?? "guest"}`, [auth?.user?.id]);
    
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("ChatBot: load history error", error);
        }

        return [{ role: "bot", text: "Halo Admin! Ada yang bisa saya bantu untuk rekap data atau aksi sistem?" }];
    });

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachedImage, setAttachedImage] = useState(null); // { temp_path, temp_url }
    
    const darkMode = useSelector((state) => state.darkMode);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const readResponseMessage = async (response) => {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await response.json().catch(() => ({}));
            return data.message || data.error || data.reply || "Permintaan gagal.";
        }

        const text = await response.text().catch(() => "");
        return text || "Permintaan gagal.";
    };

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch (error) {
            console.error("ChatBot: save history error", error);
        }

        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, storageKey]);

    const handleReset = () => {
        const initial = [{ role: "bot", text: "Halo Admin! Ada yang bisa saya bantu untuk rekap data atau aksi sistem?" }];
        setMessages(initial);
        setInput("");
        setAttachedImage(null);
        setLoading(false);
        localStorage.removeItem(storageKey);
        setShowFormat(false);
    };

    const formatItems = [
        { title: "Tambah Produk Baru", text: 'buat produk name="Kopi Susu" harga=15000 stok=50 description="Kopi manis creamy" minimum=5' },
        { title: "Update Data Produk", text: 'ubah produk id=1 name="Kopi Gula Aren" harga=18000' },
        { title: "Tambah Stok Masuk", text: 'tambah stok id=1 qty=20 unit_cost=10000 note="Restock barang"' },
        { title: "Kurangi Stok Keluar", text: 'kurangi stok id=1 qty=5 note="Penyesuaian rusak"' },
        { title: "Hapus Produk", text: 'hapus produk id=1' },
        { title: "Tambah Pelanggan", text: 'buat customer name="Budi Santoso" phone=08123456789 address="Jl. Merdeka No. 10"' },
        { title: "Hapus Pelanggan", text: 'hapus customer id=1' },
        { title: "Rekap Stok Menipis", text: "Tampilkan rekap produk yang stoknya hampir habis" },
        { title: "Rekap Penjualan Bulan Ini", text: "buatkan saya rekap penjualan bulan ini dalam bentuk table" },
        { title: "Daftar Transaksi Terbaru", text: "tampilkan rekap data transaksi terbaru" },
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch(route("admin.chatbot.upload-temp"), {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error(await readResponseMessage(res));
            }

            const data = await res.json();
            setAttachedImage({
                temp_path: data.temp_path,
                temp_url: data.temp_url
            });
        } catch (err) {
            console.error("ChatBot Upload Error:", err);
            alert(err instanceof Error ? err.message : "Gagal mengunggah foto. Pastikan ukuran di bawah 5MB dan format berupa gambar.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg && !attachedImage) return;
        if (loading || uploading) return;

        setInput("");
        const imageToSend = attachedImage;
        setAttachedImage(null);

        // Add user message to UI
        const newUserMsg = { 
            role: "user", 
            text: msg || "Mengunggah gambar...",
            image_url: imageToSend?.temp_url 
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setLoading(true);

        try {
            const historyPayload = messages
                .slice(-12)
                .map((item) => ({ role: item.role === "bot" ? "assistant" : "user", text: item.text }));

            const res = await fetch(route("admin.chatbot.messages"), {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ 
                    message: msg || "Tambah produk baru dengan gambar.", 
                    history: historyPayload,
                    image_path: imageToSend?.temp_path,
                    client_time: new Date().toISOString()
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error || "Maaf, terjadi gangguan. Silakan coba lagi.";
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", text: errMsg },
                ]);
                return;
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
        } catch (err) {
            console.error("ChatBot Fetch Error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", text: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-all hover:bg-sky-600 hover:scale-110 active:scale-95"
            >
                {open ? <IoClose className="text-2xl" /> : <IoChatbubbleEllipses className="text-2xl" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed z-50 flex flex-col shadow-2xl border transition-all duration-300 ${
                            isFullscreen
                                ? "inset-0 h-screen w-screen rounded-none"
                                : "bottom-20 right-4 h-[550px] w-[380px] rounded-2xl"
                        } ${
                            darkMode
                                ? "border-slate-700 bg-slate-800 text-slate-200"
                                : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center gap-3 bg-sky-500 px-4 py-3 text-white ${isFullscreen ? "" : "rounded-t-2xl"}`}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <IoChatbubbleEllipses className="text-lg" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">TelatenKarya AI</p>
                                <p className="text-[11px] text-white/70">Asisten khusus Admin</p>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                    title={isFullscreen ? "Kecilkan widget" : "Perbesar Fullscreen"}
                                    aria-label="Toggle Fullscreen"
                                >
                                    {isFullscreen ? <IoContractOutline className="text-lg" /> : <IoExpandOutline className="text-lg" />}
                                </button>
                                <button
                                    onClick={() => setShowFormat((current) => !current)}
                                    className="rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                    title="Lihat format perintah"
                                    aria-label="Lihat format"
                                >
                                    <TbInfoCircle className="text-lg" />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                    title="Mulai chat baru"
                                    aria-label="Chat baru"
                                >
                                    <TbRefresh className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Format Help Sidebar/Drawer inside widget */}
                        <AnimatePresence>
                            {showFormat && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs dark:border-slate-700 dark:bg-slate-900 max-h-[220px] overflow-y-auto"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-600 dark:text-slate-300">Format Perintah Admin</p>
                                        <button
                                            onClick={() => setShowFormat(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formatItems.map((item) => (
                                            <button
                                                key={item.title}
                                                onClick={() => setInput(item.text)}
                                                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-all hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-700 dark:hover:bg-slate-700"
                                            >
                                                <p className="font-semibold text-slate-700 dark:text-slate-200">{item.title}</p>
                                                <p className="mt-1 break-words text-slate-500 dark:text-slate-400 font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-1 rounded border dark:border-slate-700">{item.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                            msg.role === "user"
                                                ? "bg-sky-500 text-white rounded-br-md"
                                                : darkMode
                                                    ? "bg-slate-700 text-slate-100 rounded-bl-md"
                                                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                                        }`}
                                    >
                                        {msg.image_url && (
                                            <div className="mb-2">
                                                <img 
                                                    src={msg.image_url} 
                                                    alt="Attached file" 
                                                    className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-black/10 dark:border-white/10"
                                                />
                                            </div>
                                        )}
                                        {msg.role === "bot" ? (
                                            <div 
                                                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} 
                                                className="markdown-content"
                                            />
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div
                                        className={`rounded-2xl rounded-bl-md px-4 py-2 text-sm ${
                                            darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        <span className="flex gap-1 items-center">
                                            <span>Menganalisis</span>
                                            <span className="animate-bounce">.</span>
                                            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                                            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Image Preview Area inside Chat input box */}
                        {attachedImage && (
                            <div className={`px-4 py-2 border-t flex items-center gap-2 ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                <div className="relative h-12 w-12 rounded-lg border overflow-hidden">
                                    <img src={attachedImage.temp_url} className="h-full w-full object-cover" alt="Temp preview" />
                                    <button
                                        onClick={() => setAttachedImage(null)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                                    >
                                        <IoClose size={12} />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500">Foto siap dilampirkan...</span>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className={`flex items-center gap-2 border-t p-3 ${
                            darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
                        } ${isFullscreen ? "pb-6" : ""}`}>
                            
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || uploading}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all disabled:opacity-50 ${
                                    darkMode 
                                        ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                                        : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                                title="Lampirkan Gambar"
                            >
                                <IoImageOutline className="text-xl" />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={uploading ? "Mengunggah gambar..." : "Tulis perintah ke asisten..."}
                                disabled={loading || uploading}
                                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-sky-500 ${
                                    darkMode
                                        ? "border-slate-700 bg-slate-700 text-slate-100 placeholder-slate-400"
                                        : "border-slate-300 bg-white text-slate-700 placeholder-slate-400"
                                } disabled:opacity-50`}
                            />
                            
                            <button
                                onClick={handleSend}
                                disabled={loading || uploading || (!input.trim() && !attachedImage)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white transition-all hover:bg-sky-600 disabled:opacity-50"
                            >
                                <IoSend className="text-sm" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
