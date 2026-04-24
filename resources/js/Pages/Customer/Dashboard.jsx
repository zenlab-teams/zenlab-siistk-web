import { Head } from "@inertiajs/react";
import { TbShoppingCart } from "react-icons/tb";
import { motion } from "framer-motion";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setCurrentRoute } from "../../Redux/slice";

const CustomerDashboard = ({ flash, stats = {} }) => {
    const dispatch = useDispatch();
    useSelector((state) => state.darkMode);

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "dashboard" }));
    }, []);

    const statCards = [
        { label: "My Orders", value: stats.orders ?? 0, icon: <TbShoppingCart className="text-6xl" /> },
    ];

    return (
        <Layout flash={flash}>
            <Head>
                <title>Customer Dashboard | ZenlabSIISTK</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Customer Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Ringkasan pesanan Anda</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-5">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            className="bg-white dark:bg-slate-800 shadow-lg rounded-xl flex items-center p-5 gap-3 col-span-2"
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index + 1) * 0.1 }}
                        >
                            <div className="p-2 bg-sky-100 dark:bg-sky-500 dark:bg-opacity-20 text-sky-500 rounded-xl mr-2">
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{card.label}</p>
                                <p className="text-4xl font-bold">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                    <motion.div
                        className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 col-span-8"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-xl font-bold mb-2">Selamat Datang!</p>
                        <p className="text-slate-500 dark:text-slate-400">
                            Gunakan panel ini untuk melihat dan memantau pesanan Anda.
                        </p>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default CustomerDashboard;
