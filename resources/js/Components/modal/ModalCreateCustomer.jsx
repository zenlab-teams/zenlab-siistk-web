import { useForm } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import TextInput from "../input/TextInput";
import NumberInput from "../input/NumberInput";
import TextAreaInput from "../input/TextAreaInput";

const ModalCreateCustomer = ({ isOpen, onClose, onSuccess, initialName = "" }) => {
    const [domReady, setDomReady] = useState(false);

    useEffect(() => {
        setDomReady(true);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        number_phone: "",
        address: "",
    });

    useEffect(() => {
        if (isOpen) {
            setData("name", initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("customer.storeQuick"), {
            onSuccess: (page) => {
                onClose();
                reset();
                if (onSuccess) onSuccess(page);
            },
        });
    };

    const modalRoot = domReady ? document.getElementById("modal-root") : null;

    if (!modalRoot) return null;

    return createPortal(
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
                        className="relative z-10 w-full max-w-xl rounded-xl bg-white shadow-xl dark:bg-slate-800"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
                            <p className="text-xl font-bold">Create New Customer</p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <TbX className="text-xl" />
                            </button>
                        </div>

                        <div className="p-5">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <TextInput
                                    name="name"
                                    label="Name"
                                    placeholder="Enter Customer Name"
                                    required={true}
                                    value={data.name}
                                    onChange={setData}
                                    error={errors.name}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput
                                        type="email"
                                        name="email"
                                        label="Email"
                                        placeholder="Enter Email (optional)"
                                        value={data.email}
                                        onChange={setData}
                                        error={errors.email}
                                    />
                                    <NumberInput
                                        name="number_phone"
                                        label="Phone Number"
                                        type="phone"
                                        value={data.number_phone}
                                        onChange={setData}
                                        error={errors.number_phone}
                                    />
                                </div>
                                <TextAreaInput
                                    name="address"
                                    label="Address"
                                    placeholder="Enter Address"
                                    required={true}
                                    value={data.address}
                                    onChange={setData}
                                    error={errors.address}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                    >
                                        {processing ? "Saving..." : "Save Customer"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRoot
    );
};

export default ModalCreateCustomer;
