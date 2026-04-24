import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TbMoon, TbSun } from "react-icons/tb";

const ModeTransition = ({ darkMode }) => {
    const [domReady, setDomReady] = useState(false);
    const layout = document.getElementById("modal-root");

    useEffect(() => {
        setDomReady(true);
    }, []);

    return (
        domReady &&
        createPortal(
            <div className="fixed top-0 left-0 z-50 w-screen h-screen grid place-content-center">
                <motion.div
                    className={`${darkMode ? "bg-sky-400" : "bg-slate-800"} grid place-content-center overflow-hidden rounded-full`}
                    initial={{ width: 0, height: 0 }}
                    animate={{ width: "200rem", height: "200rem" }}
                    exit={{ width: 0, height: 0 }}
                    transition={{ duration: 1 }}
                >
                    <motion.div className="text-slate-200" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                        {darkMode ? <TbSun className="text-6xl" /> : <TbMoon className="text-6xl" />}
                    </motion.div>
                </motion.div>
            </div>,
            layout
        )
    );
};

export default ModeTransition;
