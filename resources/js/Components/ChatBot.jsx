import { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { IoChatbubbleEllipses, IoSend, IoClose } from "react-icons/io5";
import { TbInfoCircle, TbRefresh } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { usePage } from "@inertiajs/react";

const ChatBot = () => {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [showFormat, setShowFormat] = useState(true);
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

        return [{ role: "bot", text: "Halo! Ada yang bisa saya bantu?" }];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const darkMode = useSelector((state) => state.darkMode);
    const bottomRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch (error) {
            console.error("ChatBot: save history error", error);
        }

        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, storageKey]);

    const handleReset = () => {
        const initial = [{ role: "bot", text: "Halo! Ada yang bisa saya bantu?" }];
        setMessages(initial);
        setInput("");
        setLoading(false);
        localStorage.removeItem(storageKey);
        setShowFormat(true);
    };

    const formatItems = [
        { title: "Tambah produk", text: "buat produk name=Nama Barang harga=15000 stok=10 deskripsi=Minuman minimum=1" },
        { title: "Update produk", text: "ubah produk id=1 name=Nama Barang Baru harga=17000 minimum=2" },
        { title: "Tambah stok", text: "tambah stok id=1 qty=5 note=restock" },
        { title: "Kurangi stok", text: "kurangi stok id=1 qty=2 note=penjualan" },
        { title: "CRUD customer", text: "buat customer name=Andi phone=08123456789 email=andi@mail.com address=Bandung" },
    ];

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: msg }]);
        setLoading(true);

        try {
            const url = route("chat.send");
            console.log("ChatBot: sending to", url);
            const history = messages
                .slice(-12)
                .map((item) => ({ role: item.role === "bot" ? "assistant" : "user", text: item.text }));

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ message: msg, history }),
            });

            console.log("ChatBot: response status", res.status);

            if (!res.ok) {
                const errText = await res.text();
                console.error("ChatBot: error response", errText);
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", text: "Maaf, terjadi gangguan. Silakan coba lagi." },
                ]);
                return;
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
        } catch (err) {
            console.error("ChatBot: fetch error", err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", text: "Maaf, terjadi gangguan. Silakan coba lagi." },
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
                        className={`fixed bottom-20 right-4 z-50 flex h-[500px] w-[350px] flex-col rounded-2xl shadow-2xl border ${
                            darkMode
                                ? "border-slate-600 bg-slate-800 text-slate-200"
                                : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 rounded-t-2xl bg-sky-500 px-4 py-3 text-white">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <IoChatbubbleEllipses className="text-lg" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">TelatenKarya AI</p>
                                <p className="text-[11px] text-white/70">Asisten ZENLAB SIISTK</p>
                            </div>
                            <button
                                onClick={() => setShowFormat((current) => !current)}
                                className="ml-auto rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                title="Lihat format"
                                aria-label="Lihat format"
                            >
                                <TbInfoCircle className="text-lg" />
                            </button>
                            <button
                                onClick={handleReset}
                                className="ml-1 rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                title="Chat baru"
                                aria-label="Chat baru"
                            >
                                <TbRefresh className="text-lg" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFormat && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-600 dark:text-slate-300">Format command</p>
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
                                                <p className="mt-1 break-words text-slate-500 dark:text-slate-400">{item.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-sky-500 text-white rounded-br-md"
                                                : darkMode
                                                    ? "bg-slate-700 text-slate-200 rounded-bl-md"
                                                    : "bg-slate-100 text-slate-700 rounded-bl-md"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div
                                        className={`rounded-2xl rounded-bl-md px-3 py-2 text-sm ${
                                            darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        <span className="flex gap-1">
                                            <span className="animate-bounce">.</span>
                                            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                                            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className={`flex items-center gap-2 border-t p-3 ${
                            darkMode ? "border-slate-600" : "border-slate-200"
                        }`}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pesan..."
                                disabled={loading}
                                className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-sky-500 ${
                                    darkMode
                                        ? "border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400"
                                        : "border-slate-300 bg-white text-slate-700 placeholder-slate-400"
                                } disabled:opacity-50`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white transition-all hover:bg-sky-600 disabled:opacity-50"
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
