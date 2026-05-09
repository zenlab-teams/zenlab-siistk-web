import { AnimatePresence, motion } from "framer-motion";
import {
    TbLayoutDashboard,
    TbFileText,
    TbLogout2,
    TbPackage,
    TbShoppingCart,
    TbSunMoon,
    TbUsers,
} from "react-icons/tb";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Logo from "../../assets/image/Logo.svg";
import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useDispatch, useSelector } from "react-redux";
import { logout, setSidebar } from "../Redux/slice";
import DarkModeToggle from "../Components/button/DarkModeToggle";

const Sidebar = () => {
    const dispatch = useDispatch();
    const currentRoute = useSelector((state) => state.currentRoute);
    const sidebarOpen = useSelector((state) => state.sidebar);

    const { auth } = usePage().props;
    const user = auth?.user;

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.post(route("logout"));
    };

    const getDashboardRoute = () => {
        if (user?.role === "admin") { return route("admin.dashboard"); }
        if (user?.role === "sales") { return route("sales.dashboard"); }
        return route("customer.dashboard");
    };

    return (
        <aside className={`h-screen fixed top-0 left-0 w-80 z-30 bg-white dark:bg-slate-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 overflow-hidden`}>
            <div>
                <div className="flex w-full p-5 items-center justify-between mb-5">
                    <div className="flex items-center">
                        <motion.img src={Logo} className="w-6 mr-2" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                        <motion.p className="text-xl font-bold" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <span className="text-sky-500">Telaten</span>Karya
                        </motion.p>
                    </div>
                    <motion.div
                        className="sm:hidden"
                        whileHover={{ x: -5 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => dispatch(setSidebar(false))}
                    >
                        <MdKeyboardArrowLeft className="text-4xl text-slate-400 cursor-pointer" />
                    </motion.div>
                </div>
                <div className="px-3 mb-5">
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-md mb-2 ml-2 text-sm">OVERVIEW</p>
                    <Link href={getDashboardRoute()}>
                        <motion.div
                            className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                currentRoute.route === "dashboard"
                                    ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                            }`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            >
                            <TbLayoutDashboard className="text-2xl mr-3" />
                            <p className="font-bold text-lg">Dashboard</p>
                        </motion.div>
                    </Link>
                    {user?.role === "admin" && (
                        <Link href={route("product.index")}>
                            <motion.div
                                className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                    currentRoute.route === "product"
                                        ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <TbPackage className="text-2xl mr-3" />
                                <p className="font-bold text-lg">Products</p>
                            </motion.div>
                        </Link>
                    )}
                    {user?.role === "admin" && (
                        <Link href={route("order.index")}>
                            <motion.div
                                className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                    currentRoute.route === "order"
                                        ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <TbShoppingCart className="text-2xl mr-3" />
                                <p className="font-bold text-lg">Orders</p>
                            </motion.div>
                        </Link>
                    )}
                    {user?.role === "admin" && (
                        <Link href={route("offer.index")}>
                            <motion.div
                                className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                    currentRoute.route === "offer"
                                        ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <TbFileText className="text-2xl mr-3" />
                                <p className="font-bold text-lg">Offers</p>
                            </motion.div>
                        </Link>
                    )}
                    {user?.role === "sales" && (
                        <Link href={route("sales.offer.index")}>
                            <motion.div
                                className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                    currentRoute.route === "offer"
                                        ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <TbFileText className="text-2xl mr-3" />
                                <p className="font-bold text-lg">Offers</p>
                            </motion.div>
                        </Link>
                    )}
                    {user?.role === "admin" && (
                        <Link href={route("user.index")}>
                            <motion.div
                                className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                                    currentRoute.route === "user"
                                        ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <TbUsers className="text-2xl mr-3" />
                                <p className="font-bold text-lg">Users</p>
                            </motion.div>
                        </Link>
                    )}
                </div>
            </div>
            <div>
                <div className="text-slate-600 px-3">
                    <motion.div
                        className="flex items-center justify-between p-2 m-1 rounded-lg text-slate-600 dark:text-slate-400 transition-all"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center">
                            <TbSunMoon className="text-2xl mr-3" />
                            <p className="font-bold text-lg">Theme Mode</p>
                        </div>
                        <DarkModeToggle />
                    </motion.div>
                </div>
                <div className="bg-slate-200 dark:bg-slate-700 w-auto h-0.5 mx-5"></div>
                <div className="relative m-3">
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                className="bg-white dark:bg-slate-800 shadow-xl absolute p-3 bottom-20 w-full rounded-xl border-2 dark:border-slate-600 z-50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <div
                                    className="flex items-center p-2 rounded-lg cursor-pointer transition-all text-slate-600 dark:text-slate-400 hover:bg-red-100 hover:text-red-500 hover:dark:bg-red-900 dark:hover:bg-opacity-50"
                                    onClick={handleLogout}
                                >
                                    <TbLogout2 className="text-2xl mr-3" />
                                    <p className="font-bold text-lg">Logout</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        className={`flex items-center p-2 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer rounded-xl transition-all ${
                            isProfileOpen && "bg-sky-100 dark:bg-sky-900"
                        }`}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <motion.div
                            className="w-12 h-12 bg-slate-500 rounded-xl mr-3"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                        />
                        <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                            <p className="font-bold text-xl">{user?.name}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm capitalize">{user?.role}</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
