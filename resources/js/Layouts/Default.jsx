import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
import { setSidebar } from "../Redux/slice";
import Navbar from "./Navbar";
import ChatBot from "../Components/ChatBot";

const Layout = ({ children, flash = {} }) => {
    const darkMode = useSelector((state) => state.darkMode);
    const sidebarOpen = useSelector((state) => state.sidebar);
    const dispatch = useDispatch();
    const { auth } = usePage().props;

    useEffect(() => {
        const { success, error, info } = flash || {};
        if (success) { toast.success(success); }
        if (error) { toast.error(error); }
        if (info) { toast(info); }
    }, [flash]);

    return (
        <main className={`min-h-screen bg-slate-100 text-slate-900 ${darkMode && "dark"} dark:bg-slate-900 dark:text-slate-200`} id="modal-root">
            <Toaster toastOptions={{ className: "dark:!bg-slate-800 dark:!text-slate-200" }} />
            <motion.div
                className="bg-sky-200 w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] absolute left-48 -top-96 rounded-full bg-opacity-50 dark:bg-sky-900"
                initial={{ y: -80 }}
                animate={{ y: 0 }}
            />
            <Navbar />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 sm:hidden"
                    onClick={() => dispatch(setSidebar(false))}
                />
            )}
            <div className="pt-14 sm:pt-0">
                {children}
            </div>
            {auth?.user?.role === "admin" && <ChatBot />}
        </main>
    );
};

export default Layout;