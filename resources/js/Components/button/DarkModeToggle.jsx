import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbMoon, TbSun } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "../../Redux/slice";
import ModeTransition from "../../Layouts/ModeTransition";

const DarkModeToggle = () => {
    const dispatch = useDispatch();

    const initialValue = useSelector((state) => state.darkMode);

    const [darkMode, isDarkMode] = useState(initialValue);
    const [transitionMode, setTransitionMode] = useState(false);

    const handleDarkModeToggle = () => {
        setTransitionMode(true);
        setTimeout(() => {
            if (darkMode) {
                isDarkMode(false);
            } else {
                isDarkMode(true);
            }
            setTransitionMode(false);
        }, 500);
    };

    useEffect(() => {
        if (darkMode) {
            dispatch(setDarkMode(true));
        } else {
            dispatch(setDarkMode(false));
        }
    }, [darkMode]);

    return (
        <>
            <AnimatePresence>{transitionMode && <ModeTransition darkMode={darkMode} />}</AnimatePresence>
            <motion.div
                className="w-20 h-10 rounded-full relative cursor-pointer"
                animate={
                    darkMode
                        ? { background: "linear-gradient(125deg, rgba(3,105,161,1) 0%, rgba(2,132,199,1) 100%)" }
                        : { background: "linear-gradient(125deg, rgba(186,230,253,1) 0%, rgba(56,189,248,1) 100%)" }
                }
                onClick={handleDarkModeToggle}
            >
                <motion.div
                    className="absolute h-8 w-8 rounded-full shadow-xl z-20"
                    initial={{ scale: 0, top: 4 }}
                    animate={
                        darkMode
                            ? { scale: 1, right: 5, left: "inherit", backgroundColor: "#1e293b" }
                            : { scale: 1, left: 5, right: "inherit", backgroundColor: "#ffffff" }
                    }
                ></motion.div>
                <motion.div
                    className="absolute z-10 text-white"
                    initial={{ scale: 0, top: 10 }}
                    animate={darkMode ? { scale: 1, left: 10, right: "inherit" } : { scale: 1, right: 10, left: "inherit" }}
                >
                    {darkMode ? <TbMoon className="text-xl" /> : <TbSun className="text-xl" />}
                </motion.div>
            </motion.div>
        </>
    );
};

export default DarkModeToggle;
