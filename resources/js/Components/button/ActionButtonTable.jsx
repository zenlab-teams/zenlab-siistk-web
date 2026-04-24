import { TbDots, TbDotsVertical, TbEdit, TbTrash } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const ActionButtonTable = ({ itemId }) => {
    const [isActionOpen, setIsActionOpen] = useState(true);

    const handleActionOpen = () => {
        isActionOpen ? setIsActionOpen(false) : setIsActionOpen(true);
    }

    return (
        <motion.div className="flex justify-center relative" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <TbDots className="text-2xl text-slate-500 hover:text-sky-500 cursor-pointer" onClick={handleActionOpen} />
            <AnimatePresence>
                {isActionOpen ? (
                    <motion.div
                        className="absolute  bg-white shadow-xl z-50 p-3 rounded-xl border-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center p-2 rounded-lg cursor-pointer transition-all text-slate-600 hover:bg-slate-200">
                            <TbEdit className="text-2xl mr-3" />
                            <p className="font-bold text-lg">Edit</p>
                        </div>
                        <div className="flex items-center p-2 rounded-lg cursor-pointer transition-all text-slate-600 hover:bg-red-100 hover:text-red-500">
                            <TbTrash className="text-2xl mr-3" />
                            <p className="font-bold text-lg">Delete</p>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
};

export default ActionButtonTable;
