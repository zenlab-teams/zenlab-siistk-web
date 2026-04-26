import { createPortal } from "react-dom";
import { TbAlertSmall, TbX } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { router as Inertia } from "@inertiajs/react";

const ModalDelete = ({ itemID, closeModal, type, description }) => {
    const layout = document.getElementById("modal-root");

    const handleDelete = () => {
        let routeName = "";
        let params = itemID;

        if (type == "category") {
            routeName = "category.destroy";
        } else if (type == "category_selected") {
            routeName = "category.destroySelected";
            params = itemID.join(",");
        } else if (type == "product") {
            routeName = "product.destroy";
        } else if (type == "product_selected") {
            routeName = "product.destroySelected";
            params = itemID.join(",");
        } else if (type == "supplier") {
            routeName = "supplier.destroy";
        } else if (type == "supplier_selected") {
            routeName = "supplier.destroySelected";
            params = itemID.join(",");
        } else if (type == "customer") {
            routeName = "customer.destroy";
        } else if (type == "customer_selected") {
            routeName = "customer.destroySelected";
            params = itemID.join(",");
        } else if (type == "user") {
            routeName = "user.destroy";
        } else if (type == "user_selected") {
            routeName = "user.destroySelected";
            params = itemID.join(",");
        }

        Inertia.delete(route(routeName, params), {
            onSuccess: () => console.log("Item deleted successfully"),
            onError: () => closeModal(),
        });
    };

    const [domReady, setDomReady] = useState(false);

    useEffect(() => {
        setDomReady(true);
    }, []);

    return (
        domReady &&
        createPortal(
            <div className="fixed top-0 left-0 h-screen w-screen z-50 flex justify-center items-center">
                <motion.div
                    className="fixed top-0 left-0 h-screen w-screen -z-10 bg-black bg-opacity-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                ></motion.div>
                <motion.div
                    className="bg-white dark:bg-slate-800 min-h-52 min-w-80 rounded-xl shadow-xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                >
                    <div className="bg-red-200 w-full h-20 flex justify-center relative dark:bg-red-500 dark:bg-opacity-20">
                        <div
                            className="m-2 p-1 absolute right-0 top-0 hover:bg-slate-200 hover:bg-opacity-50 rounded-lg cursor-pointer transition-all"
                            onClick={() => closeModal()}
                        >
                            <TbX className="text-2xl text-slate-500" />
                        </div>
                        <TbAlertSmall className="text-7xl text-white bg-red-500 rounded-full absolute -bottom-9 dark:text-slate-800" />
                    </div>
                    <div className="flex flex-col justify-center items-center mt-12 px-5 pb-6 gap-1">
                        <h1 className="text-2xl font-bold">Delete</h1>
                        <p className="text-slate-500 text-center text-lg whitespace-normal w-60 dark:text-slate-400">{description}</p>
                        <button
                            onClick={handleDelete}
                            className="bg-red-400 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold py-2 w-full rounded-xl mt-3 hover:bg-red-500 transition-all"
                        >
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </div>,
            layout
        )
    );
};

export default ModalDelete;
