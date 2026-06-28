import { useDispatch } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbPlus, TbTrash, TbCopy, TbPhotoPlus, TbX } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import TextInput from "../../Components/input/TextInput";
import NumberInput from "../../Components/input/NumberInput";

const emptyRow = () => ({
    key: Date.now() + Math.random(),
    name: "",
    price: null,
    minimum: null,
    description: "",
    thumbnail: null,
    thumbnailPreview: null,
    initial_quantity: null,
    initial_unit_cost: null,
});

const BulkCreate = ({ flash, errors }) => {
    const dispatch = useDispatch();
    const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, []);

    const addRow = () => {
        if (rows.length >= 50) return;
        setRows((prev) => [...prev, emptyRow()]);
    };

    const duplicateRow = (index) => {
        if (rows.length >= 50) return;
        const source = rows[index];
        const newRow = { ...source, key: Date.now() + Math.random(), thumbnail: null, thumbnailPreview: null };
        setRows((prev) => {
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);
            return updated;
        });
    };

    const removeRow = (index) => {
        if (rows.length <= 1) return;
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const updateRow = useCallback((index, field, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleThumbnailChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                thumbnail: file,
                thumbnailPreview: URL.createObjectURL(file),
            };
            return updated;
        });
    };

    const removeThumbnail = (index) => {
        setRows((prev) => {
            const updated = [...prev];
            if (updated[index].thumbnailPreview) {
                URL.revokeObjectURL(updated[index].thumbnailPreview);
            }
            updated[index] = { ...updated[index], thumbnail: null, thumbnailPreview: null };
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const normalizeOptionalNumber = (value) => (value === "" || value === null ? null : value);

        const products = rows.map(({ name, price, minimum, description, thumbnail, initial_quantity, initial_unit_cost }) => ({
            name,
            price,
            minimum: normalizeOptionalNumber(minimum),
            description: description || null,
            thumbnail: thumbnail || null,
            initial_quantity: normalizeOptionalNumber(initial_quantity),
            initial_unit_cost: normalizeOptionalNumber(initial_unit_cost),
        }));

        router.post(route("product.bulkStore"), { products }, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleReset = () => {
        setRows([emptyRow(), emptyRow(), emptyRow()]);
    };

    const getError = (index, field) => {
        if (!errors) return null;
        return errors[`products.${index}.${field}`] || null;
    };

    const hasAnyErrors = errors && Object.keys(errors).length > 0;

    return (
        <Layout flash={flash}>
            <Head>
                <title>Tambah Massal Produk | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Produk</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Tambah Massal Produk</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <p className="text-xl font-bold">Tambah Massal Produk</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                Tambah hingga 50 produk sekaligus dengan gambar opsional.
                            </p>
                        </div>
                        <Link
                            href={route("product.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Kembali
                        </Link>
                    </div>

                    {hasAnyErrors && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                        >
                            Silakan perbaiki error di bawah sebelum mengirim.
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {rows.map((row, index) => (
                                    <motion.div
                                        key={row.key}
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: -50, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 relative group"
                                    >
                                        {/* Row header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                                #{index + 1}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => duplicateRow(index)}
                                                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-all"
                                                    title="Duplikat baris"
                                                >
                                                    <TbCopy className="text-lg" />
                                                </button>
                                                {rows.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(index)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                        title="Hapus baris"
                                                    >
                                                        <TbTrash className="text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="flex-shrink-0">
                                                <label className="text-sm mb-1 block">Gambar</label>
                                                <label className="cursor-pointer block">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/jpeg,image/jpg,image/png"
                                                        onChange={(e) => handleThumbnailChange(index, e)}
                                                    />
                                                    {row.thumbnailPreview ? (
                                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden group/thumb">
                                                            <img
                                                                src={row.thumbnailPreview}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 hidden group-hover/thumb:flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.preventDefault(); removeThumbnail(index); }}
                                                                    className="p-1 bg-red-500 rounded-full text-white"
                                                                >
                                                                    <TbX className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={`w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:border-sky-400 dark:hover:border-sky-600 transition-all ${
                                                            getError(index, "thumbnail")
                                                                ? "border-red-300 dark:border-red-800"
                                                                : "border-slate-300 dark:border-slate-600"
                                                        }`}>
                                                            <TbPhotoPlus className="text-2xl text-slate-400" />
                                                            <span className="text-xs text-slate-400">Unggah</span>
                                                        </div>
                                                    )}
                                                </label>
                                                {getError(index, "thumbnail") && (
                                                    <p className="text-xs text-red-400 font-bold mt-1">{getError(index, "thumbnail")}</p>
                                                )}
                                            </div>

                                            {/* Text fields */}
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <TextInput
                                                        name={`name-${index}`}
                                                        label="Nama Produk"
                                                        placeholder="Masukkan Nama Produk"
                                                        required={true}
                                                        value={row.name}
                                                        onChange={(_, val) => updateRow(index, "name", val)}
                                                        error={getError(index, "name")}
                                                    />
                                                    <NumberInput
                                                        type="currency"
                                                        name={`price-${index}`}
                                                        label="Harga"
                                                        placeholder="Masukkan Harga (Rp)"
                                                        required={true}
                                                        value={row.price}
                                                        onChange={(_, val) => updateRow(index, "price", val)}
                                                        error={getError(index, "price")}
                                                    />
                                                    <TextInput
                                                        name={`description-${index}`}
                                                        label="Deskripsi"
                                                        placeholder="Masukkan Deskripsi (opsional)"
                                                        value={row.description}
                                                        onChange={(_, val) => updateRow(index, "description", val)}
                                                        error={getError(index, "description")}
                                                    />
                                                </div>

                                                <div className="mt-3">
                                                    <NumberInput
                                                        name={`minimum-${index}`}
                                                        label="Stok Minimum (opsional)"
                                                        placeholder="Masukkan Stok Minimum"
                                                        value={row.minimum}
                                                        onChange={(_, val) => updateRow(index, "minimum", val)}
                                                        min={0}
                                                        error={getError(index, "minimum")}
                                                    />
                                                </div>

                                                {/* Initial stock fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <NumberInput
                                                        name={`initial_quantity-${index}`}
                                                        label="Stok Awal (opsional)"
                                                        placeholder="Jumlah"
                                                        value={row.initial_quantity}
                                                        onChange={(_, val) => updateRow(index, "initial_quantity", val)}
                                                        error={getError(index, "initial_quantity")}
                                                    />
                                                    <NumberInput
                                                        type="currency"
                                                        name={`initial_unit_cost-${index}`}
                                                        label="Harga Satuan (opsional)"
                                                        placeholder="Masukkan Harga Satuan (Rp)"
                                                        value={row.initial_unit_cost}
                                                        onChange={(_, val) => updateRow(index, "initial_unit_cost", val)}
                                                        error={getError(index, "initial_unit_cost")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Add row button */}
                        <button
                            type="button"
                            onClick={addRow}
                            disabled={rows.length >= 50}
                            className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-600 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-sky-500 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <TbPlus className="text-xl" />
                            Tambah Baris ({rows.length}/50)
                        </button>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t-2 dark:border-slate-700">
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                {rows.length} produk akan dibuat
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? "Menyimpan..." : `Tambah ${rows.length} Produk`}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </Layout>
    );
};

export default BulkCreate;
