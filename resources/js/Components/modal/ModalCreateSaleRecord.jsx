import { useForm } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { TbPlus, TbTrash, TbX } from "react-icons/tb";
import SelectInput from "../input/SelectInput";
import TextAreaInput from "../input/TextAreaInput";
import NumberInput from "../input/NumberInput";
import ModalCreateCustomer from "./ModalCreateCustomer";

const createEmptyRecordItem = () => ({
    product_id: null,
    quantity: 1,
    sold_price: 0,
});

const ModalCreateSaleRecord = ({ 
    isOpen, 
    onClose, 
    offer, 
    saleOptions, 
    customerOptions, 
    productOptions, 
    remainingStockMap,
    flash,
    saleId,
    routeName = "offer.record.store"
}) => {
    const [domReady, setDomReady] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [initialCustomerName, setInitialCustomerName] = useState("");
    const prevCustomersLength = useRef(customerOptions.length);

    useEffect(() => {
        setDomReady(true);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        sale_id: null,
        customer_id: null,
        notes: "",
        items: [createEmptyRecordItem()],
    });

    const isAdmin = routeName === "offer.record.store";

    useEffect(() => {
        if (saleId) {
            setData("sale_id", saleId);
        } else if (isAdmin && !data.sale_id && saleOptions.length > 0) {
            setData("sale_id", saleOptions[0].value);
        }
    }, [isAdmin, saleOptions, saleId]);

    useEffect(() => {
        if (flash?.new_customer_id) {
            setData("customer_id", flash.new_customer_id);
        }
    }, [flash?.new_customer_id]);

    const addRecordItem = () => {
        setData("items", [...data.items, createEmptyRecordItem()]);
    };

    const removeRecordItem = (index) => {
        setData(
            "items",
            data.items.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const updateRecordItem = (index, patch) => {
        const nextItems = [...data.items];
        nextItems[index] = { ...nextItems[index], ...patch };
        setData("items", nextItems);
    };

    const handleRecordProductChange = (index, productId) => {
        updateRecordItem(index, {
            product_id: productId ? Number(productId) : null,
            quantity: 1,
            sold_price: 0,
        });
    };

    const handleRecordQtyChange = (index, value) => {
        const item = data.items[index];
        const stock = remainingStockMap[item.product_id] ?? 0;

        updateRecordItem(index, {
            quantity: Math.max(1, Math.min(stock > 0 ? stock : 1, Number(value) || 1)),
        });
    };

    const handleRecordPriceChange = (index, value) => {
        updateRecordItem(index, {
            sold_price: Math.max(0, Number(value) || 0),
        });
    };

    const handleCreateCustomer = (inputValue) => {
        setInitialCustomerName(inputValue);
        setShowCustomerModal(true);
    };

    const handleSubmitRecord = (event) => {
        event.preventDefault();
        post(route(routeName, offer.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const recordTotal = data.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0) * (Number(item.sold_price) || 0);
    }, 0);

    const recordError = (index, field) => errors[`items.${index}.${field}`];

    const modalRoot = domReady ? document.getElementById("modal-root") : null;

    if (!domReady || !modalRoot) return null;

    return (
        <>
            <ModalCreateCustomer 
                isOpen={showCustomerModal} 
                onClose={() => setShowCustomerModal(false)}
                initialName={initialCustomerName}
            />
            {domReady && modalRoot && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="fixed inset-0 bg-black/30 dark:bg-black/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={onClose}
                            />

                            <motion.div
                                className="relative z-10 w-full max-w-6xl rounded-xl bg-white shadow-xl dark:bg-slate-800"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
                                    <p className="text-xl font-bold">Tambah Laporan Penjualan</p>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <TbX className="text-xl" />
                                    </button>
                                </div>

                                <div className="p-5">
                                    <form onSubmit={handleSubmitRecord} className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <SelectInput
                                                    name="customer_id"
                                                    label="Pelanggan"
                                                    placeholder="Pilih pelanggan (opsional)"
                                                    options={customerOptions}
                                                    value={data.customer_id}
                                                    onChange={setData}
                                                    error={errors.customer_id}
                                                    creatable={true}
                                                    onCreateOption={handleCreateCustomer}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <TextAreaInput
                                                    name="notes"
                                                    label="Catatan"
                                                    placeholder="Catatan tambahan (opsional)"
                                                    value={data.notes}
                                                    onChange={setData}
                                                    error={errors.notes}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                <p className="text-lg font-bold">Items Laporan</p>
                                                <button
                                                    type="button"
                                                    onClick={addRecordItem}
                                                    className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all"
                                                >
                                                    <TbPlus className="text-xl" /> Tambah Item
                                                </button>
                                            </div>

                                            {errors.items && <p className="text-red-400 font-bold mb-3">{errors.items}</p>}

                                            <div className="flex flex-col gap-3">
                                                {data.items.length === 0 && (
                                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                                                        Belum ada item laporan.
                                                    </div>
                                                )}

                                                {data.items.map((item, index) => {
                                                    const subtotal = (Number(item.quantity) || 0) * (Number(item.sold_price) || 0);

                                                    return (
                                                        <div
                                                            key={`record-item-${index}`}
                                                            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
                                                        >
                                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                                                <div className="lg:col-span-5">
                                                                    <SelectInput
                                                                        name={`product_${index}`}
                                                                        label="Produk"
                                                                        placeholder="Pilih produk"
                                                                        options={productOptions}
                                                                        value={item.product_id}
                                                                        onChange={(_, value) => handleRecordProductChange(index, value)}
                                                                        error={recordError(index, "product_id")}
                                                                        required={true}
                                                                        formatOptionLabel={(option) => (
                                                                            <div className="flex items-center justify-between gap-4">
                                                                                <span className="font-medium">{option.label}</span>
                                                                                <div className="flex items-center gap-3 text-xs">
                                                                                    <span className="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded font-bold">
                                                                                        Target: Rp{option.targetPrice?.toLocaleString("id-ID")}
                                                                                    </span>
                                                                                    <span className={`px-2 py-0.5 rounded font-bold ${option.stock <= 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                                                                                        Sisa: {option.stock}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <label className="mb-1 block">
                                                                        Qty<span className="text-sm text-red-500 font-bold"> *</span>
                                                                    </label>
                                                                    <NumberInput
                                                                        name={`quantity_${index}`}
                                                                        qty={index}
                                                                        value={item.quantity}
                                                                        min={1}
                                                                        max={remainingStockMap[item.product_id] ?? null}
                                                                        onChange={handleRecordQtyChange}
                                                                    />
                                                                    {recordError(index, "quantity") && (
                                                                        <p className="text-red-400 font-bold mt-1">{recordError(index, "quantity")}</p>
                                                                    )}
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <div className="mb-1 flex items-center justify-between gap-3">
                                                                        <label className="block">
                                                                            Harga Jual<span className="text-sm text-red-500 font-bold"> *</span>
                                                                        </label>
                                                                    </div>
                                                                    <NumberInput
                                                                        name={`sold_price_${index}`}
                                                                        qty={index}
                                                                        value={item.sold_price}
                                                                        min={0}
                                                                        onChange={handleRecordPriceChange}
                                                                        type="currency"
                                                                    />
                                                                    {recordError(index, "sold_price") && (
                                                                        <p className="text-red-400 font-bold mt-1">{recordError(index, "sold_price")}</p>
                                                                    )}
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <label className="mb-1 block">Subtotal</label>
                                                                    <div className="px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                                        Rp{subtotal.toLocaleString("id-ID")}
                                                                    </div>
                                                                </div>
                                                                <div className="lg:col-span-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeRecordItem(index)}
                                                                        className="w-full h-[45px] flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                                    >
                                                                        <TbTrash className="text-2xl" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 min-w-72">
                                                    <div className="flex justify-between items-center text-lg font-bold">
                                                        <span>Total Laporan</span>
                                                        <span>Rp{recordTotal.toLocaleString("id-ID")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                            >
                                                {processing ? "Mengirim..." : "Kirim Laporan"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                modalRoot
            )}
        </>
    );
};

export default ModalCreateSaleRecord;
