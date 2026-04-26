import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import { TbDots } from "react-icons/tb";
import { useState } from "react";

const PaginationButton = ({ currentPage, totalPages, onPageChange }) => {
    const [isAllPageOpen, setIsAllPageOpen] = useState(false);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-3">
            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            >
                <IoIosArrowBack />
            </button>

            {totalPages > 5 ? (
                currentPage === 1 ? (
                    <>
                        <button
                            className="text-base bg-sky-400 text-white font-bold px-3 py-1 rounded-lg dark:text-slate-800"
                            onClick={() => onPageChange(1)}
                        >
                            1
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(2)}
                        >
                            2
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(3)}
                        >
                            3
                        </button>
                    </>
                ) : currentPage === totalPages ? (
                    <>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(totalPages - 2)}
                        >
                            {totalPages - 2}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(totalPages - 1)}
                        >
                            {totalPages - 1}
                        </button>
                        <button
                            className="text-base bg-sky-400 text-white font-bold px-3 py-1 rounded-lg dark:text-slate-800"
                            onClick={() => onPageChange(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            {currentPage - 1}
                        </button>
                        <button
                            className="text-base bg-sky-400 text-white font-bold px-3 py-1 rounded-lg dark:text-slate-800"
                            onClick={() => onPageChange(currentPage)}
                        >
                            {currentPage}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            {currentPage + 1}
                        </button>
                    </>
                )
            ) : (
                pages.map((page) => (
                    <button
                        key={page}
                        className={`text-base font-bold px-3 py-1 rounded-lg ${
                            page === currentPage
                                ? "bg-sky-400 text-white"
                                : "text-slate-400 hover:bg-sky-100 hover:text-sky-500 transition-all"
                        }`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))
            )}

            {totalPages > 5 && (
                <>
                    <div className="relative text-slate-500">
                        <span
                            className={`p-3 rounded-lg h-fit block cursor-pointer ${
                                isAllPageOpen
                                    ? "bg-sky-100 text-sky-500 dark:bg-sky-500 dark:bg-opacity-20"
                                    : "hover:bg-sky-100 hover:text-sky-500 dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            }`}
                            onClick={() => setIsAllPageOpen(!isAllPageOpen)}
                        >
                            <TbDots />
                        </span>
                        <AnimatePresence>
                            {isAllPageOpen && (
                                <motion.div
                                    className="grid grid-cols-5 gap-1 justify-items-center w-56 bg-white dark:bg-slate-800 shadow-xl absolute p-2 bottom-12 -right-[6rem] rounded-xl border-2 dark:border-slate-600 z-50"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    {pages.map((page) => (
                                        <button
                                            key={page}
                                            className={`text-base font-bold px-3 py-1 rounded-lg ${
                                                page === currentPage
                                                    ? "bg-sky-400 text-white dark:text-slate-800"
                                                    : "text-slate-500 hover:bg-sky-100 hover:text-sky-500 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                                            }`}
                                            onClick={() => onPageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        className={`text-base px-3 py-1 rounded-lg font-bold ${
                            currentPage === totalPages
                                ? "bg-sky-400 text-white dark:text-slate-800"
                                : "text-slate-500 hover:bg-sky-100 hover:text-sky-500 dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                        }`}
                        onClick={() => onPageChange(totalPages)}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            >
                <IoIosArrowForward />
            </button>
        </div>
    );
};

export default PaginationButton;
