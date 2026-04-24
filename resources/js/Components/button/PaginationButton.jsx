import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import { TbDots } from "react-icons/tb";
import { useState } from "react";

const PaginationButton = ({ pagination, data }) => {
    const currentPage = pagination.state.page;
    const totalPage = pagination.state.getTotalPages(data.nodes);

    const [isAllPageOpen, setIsAllPageOpen] = useState(false);

    return (
        <div className="flex justify-center items-center gap-3">
            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => (currentPage != 0 ? pagination.fns.onSetPage(currentPage - 1) : false)}
            >
                <IoIosArrowBack />
            </button>
            {totalPage > 5 ? (
                currentPage == 0 ? (
                    <>
                        <button
                            className="text-base bg-sky-400 text-white font-bold px-3 py-1 rounded-lg dark:text-slate-800"
                            onClick={() => pagination.fns.onSetPage(currentPage)}
                        >
                            {currentPage + 1}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage + 1)}
                        >
                            {currentPage + 2}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage + 2)}
                        >
                            {currentPage + 3}
                        </button>
                    </>
                ) : currentPage == totalPage - 1 ? (
                    <>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage - 3)}
                        >
                            {currentPage - 2}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage - 2)}
                        >
                            {currentPage - 1}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage - 1)}
                        >
                            {currentPage}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage - 1)}
                        >
                            {currentPage}
                        </button>
                        <button
                            className="text-base bg-sky-400 text-white font-bold px-3 py-1 rounded-lg dark:text-slate-800"
                            onClick={() => pagination.fns.onSetPage(currentPage)}
                        >
                            {currentPage + 1}
                        </button>
                        <button
                            className="text-base text-slate-500 hover:bg-sky-100 hover:text-sky-500 font-bold px-3 py-1 rounded-lg dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            onClick={() => pagination.fns.onSetPage(currentPage + 1)}
                        >
                            {currentPage + 2}
                        </button>
                    </>
                )
            ) : (
                pagination.state.getPages(data.nodes).map((data, index) => (
                    <button
                        key={index}
                        className={`text-base font-bold px-3 py-1 rounded-lg ${
                            index == currentPage ? "bg-sky-400 text-white" : "text-slate-400 hover:bg-sky-100 hover:text-sky-500 transition-all"
                        }`}
                        onClick={() => pagination.fns.onSetPage(index)}
                    >
                        {index + 1}
                    </button>
                ))
            )}
            {totalPage > 5 && (
                <>
                    <div className="relative text-slate-500">
                        <span
                            className={`p-3 rounded-lg h-fit block cursor-pointer ${
                                isAllPageOpen ? "bg-sky-100 text-sky-500 dark:bg-sky-500 dark:bg-opacity-20" : "hover:bg-sky-100 hover:text-sky-500 dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                            }`}
                            onClick={() => (isAllPageOpen ? setIsAllPageOpen(false) : setIsAllPageOpen(true))}
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
                                    {pagination.state.getPages(data.nodes).map((data, index) => (
                                        <button
                                            key={index}
                                            className={`text-base font-bold px-3 py-1 rounded-lg ${
                                                index == currentPage ? "bg-sky-400 text-white dark:text-slate-800" : "text-slate-500 hover:bg-sky-100 hover:text-sky-500 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                                            }`}
                                            onClick={() => pagination.fns.onSetPage(index)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        className={`text-base px-3 py-1 rounded-lg font-bold ${
                            currentPage == totalPage - 1 ? "bg-sky-400 text-white dark:text-slate-800" : "text-slate-500 hover:bg-sky-100 hover:text-sky-500 dark:text-slate-400 dark:hover:bg-sky-500 dark:hover:bg-opacity-20 transition-all"
                        }`}
                        onClick={() => pagination.fns.onSetPage(totalPage - 1)}
                    >
                        {totalPage}
                    </button>
                </>
            )}
            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => (currentPage != totalPage - 1 ? pagination.fns.onSetPage(currentPage + 1) : false)}
            >
                <IoIosArrowForward />
            </button>
        </div>
    );
};

export default PaginationButton;
