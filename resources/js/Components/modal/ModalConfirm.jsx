import { createPortal } from "react-dom";
import { TbAlertSmall, TbX } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { router as Inertia } from "@inertiajs/react";

const ModalConfirm = ({ closeModal, title, description, action }) => {
    const layout = document.getElementById("modal-root");

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
                    className="bg-white dark:bg-slate-800 min-h-52 min-w-80 max-w-[30%] rounded-3xl shadow-xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                >
                    <div className="bg-sky-200 w-full h-20 flex justify-center relative dark:bg-sky-500 dark:bg-opacity-20">
                        <div
                            className="m-2 p-1 absolute right-0 top-0 hover:bg-slate-200 hover:bg-opacity-50 rounded-lg cursor-pointer transition-all"
                            onClick={() => closeModal()}
                        >
                            <TbX className="text-2xl text-slate-500" />
                        </div>
                        <TbAlertSmall className="text-7xl text-white bg-sky-500 rounded-full absolute -bottom-9 dark:text-slate-800" />
                    </div>
                    <div className="flex flex-col justify-center items-center mt-12 px-5 pb-6 gap-1">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-slate-500 text-center text-lg whitespace-normal dark:text-slate-400">{description}</p>
                        <button
                            onClick={action}
                            className="bg-sky-400 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-bold py-2 w-full rounded-xl mt-3 hover:bg-sky-500 transition-all"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </motion.div>
            </div>,
            layout
        )
    );
};

export default ModalConfirm;
