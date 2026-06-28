import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import {
    TbAlertTriangle,
    TbCheck,
    TbClock,
    TbCurrencyDollar,
    TbPhoto,
    TbShoppingCart,
} from "react-icons/tb";
import { useDispatch } from "react-redux";
import Layout from "../Layouts/Default";
import Sidebar from "../Layouts/Sidebar";
import { setCurrentRoute } from "../Redux/slice";
import AnalyticsCard from "../Components/dashboard/AnalyticsCard";

const statusClassMap = {
    completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
    cancelled: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
    expired: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
};

const paymentClassMap = {
    unpaid: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
    partial: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
    paid: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const cardColorMap = {
    emerald: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-500 dark:text-emerald-400",
    },
    sky: {
        bg: "bg-sky-100 dark:bg-sky-900/30",
        text: "text-sky-500 dark:text-sky-400",
    },
    teal: {
        bg: "bg-teal-100 dark:bg-teal-900/30",
        text: "text-teal-500 dark:text-teal-400",
    },
    orange: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-500 dark:text-orange-400",
    },
    red: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-500 dark:text-red-400",
    },
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorClass = cardColorMap[color] ?? cardColorMap.sky;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClass.bg}`}>
                <Icon className={`text-xl ${colorClass.text}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
        </div>
    );
};

const Dashboard = ({ flash, stats = {}, recentOrders = [], lowStockProducts = [] }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "dashboard", subRoute: null }));
    }, [dispatch]);

    return (
        <Layout flash={flash}>
            <Head>
                <title>Dashboard | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Rekap harian bisnis</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        icon={TbCurrencyDollar}
                        label="Omzet Hari Ini"
                        value={`Rp${Number(stats.revenue_today ?? 0).toLocaleString("id-ID")}`}
                        color="emerald"
                    />
                    <StatCard
                        icon={TbShoppingCart}
                        label="Pesanan Masuk"
                        value={Number(stats.orders_today ?? 0)}
                        color="sky"
                    />
                    <StatCard
                        icon={TbCheck}
                        label="Selesai"
                        value={Number(stats.completed_today ?? 0)}
                        color="teal"
                    />
                    <StatCard
                        icon={TbClock}
                        label="Pending Bayar"
                        value={Number(stats.pending_payment ?? 0)}
                        color="orange"
                    />
                    <StatCard
                        icon={TbAlertTriangle}
                        label="Stok Kritis"
                        value={Number(stats.low_stock_count ?? 0)}
                        color="red"
                    />
                </div>

                <AnalyticsCard />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xl font-bold">Pesanan Terbaru</p>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {recentOrders.length} data
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                                        <th className="py-2 pr-3">Pelanggan</th>
                                        <th className="py-2 pr-3">Total</th>
                                        <th className="py-2 pr-3">Status Pesanan</th>
                                        <th className="py-2 pr-3">Pembayaran</th>
                                        <th className="py-2">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => {
                                            const orderStatus = order.status ?? "pending";
                                            const paymentStatus = order.invoice?.status ?? "unpaid";

                                            return (
                                                <tr key={order.id} className="border-b dark:border-slate-700 last:border-0">
                                                    <td className="py-3 pr-3">
                                                        {order.customer?.name ?? (
                                                            <span className="italic text-slate-400">Walk-in</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        Rp{Number(order.total_price ?? 0).toLocaleString("id-ID")}
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${
                                                                statusClassMap[orderStatus] ?? statusClassMap.pending
                                                            }`}
                                                        >
                                                            {orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${
                                                                paymentClassMap[paymentStatus] ?? paymentClassMap.unpaid
                                                            }`}
                                                        >
                                                            {paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                                                Belum ada pesanan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-4">
                            <Link
                                href={route("order.index")}
                                className="text-sky-500 hover:text-sky-600 font-bold text-sm"
                            >
                                Lihat Semua -&gt;
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xl font-bold">Produk Stok Rendah</p>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {lowStockProducts.length} data
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                                        <th className="py-2 pr-3">Gambar</th>
                                        <th className="py-2 pr-3">Nama Produk</th>
                                        <th className="py-2">Stok</th>
                                    </tr>
                                </thead>
                                        <tbody>
                                            {lowStockProducts.length > 0 ? (
                                                lowStockProducts.map((product) => {
                                                    const currentStock = Number(product.stocks_sum_quantity ?? 0);
                                                    const minimum = Number(product.minimum ?? 0);

                                                    return (
                                                        <tr key={product.id} className="border-b dark:border-slate-700 last:border-0">
                                                            <td className="py-3 pr-3">
                                                                {product.thumbnail ? (
                                                                    <img
                                                                        src={`/storage/${product.thumbnail}`}
                                                                        className="w-8 h-8 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                                        <TbPhoto className="text-slate-400 dark:text-slate-500" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 pr-3">{product.name}</td>
                                                            <td className="py-3 text-red-500 font-bold">
                                                                {currentStock} / {minimum}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-slate-500">
                                                        Tidak ada stok kritis.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                        <div className="pt-4">
                            <Link
                                href={route("product.index")}
                                className="text-sky-500 hover:text-sky-600 font-bold text-sm"
                            >
                                Lihat Semua -&gt;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Dashboard;
