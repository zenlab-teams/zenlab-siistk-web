import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { TbEye } from "react-icons/tb";
import DataTable from "../../Components/DataTable";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";

const OrderIndex = ({ flash, orders, filters }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "order", subRoute: null }));
    }, [dispatch]);

    const orderStatusClassMap = {
        completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        pending: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
        cancelled: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
        expired: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
    };

    const paymentStatusClassMap = {
        unpaid: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
        partial: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
        paid: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Pesanan | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Pesanan</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Daftar semua pesanan</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={orders.data}
                        meta={orders}
                        filters={filters}
                        routeName="order.index"
                        searchPlaceholder="Cari Nama Pelanggan"
                        gridLayout="0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"
                        selectable={false}
                        title="Pesanan"
                        addHref={route("order.create")}
                        addLabel="Tambah Pesanan"
                        columns={[
                            {
                                key: "actions",
                                label: "Aksi",
                                render: (item) => (
                                    <div className="flex justify-center">
                                        <Link href={route("order.show", item.id)}>
                                            <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                    </div>
                                ),
                            },
                            {
                                key: "customer",
                                label: "Pelanggan",
                                render: (item) =>
                                    item.customer?.name ?? <span className="text-slate-400 italic">Walk-in</span>,
                            },
                            {
                                key: "total_price",
                                label: "Total",
                                sortKey: "total_price",
                                render: (item) => `Rp${item.total_price.toLocaleString("id-ID")}`,
                            },
                            {
                                key: "status",
                                label: "Status Pesanan",
                                render: (item) => (
                                    <span
                                        className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${
                                            orderStatusClassMap[item.status] ?? orderStatusClassMap.pending
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                ),
                            },
                            {
                                key: "invoice_status",
                                label: "Pembayaran",
                                render: (item) => {
                                    const status = item.invoice?.status ?? "unpaid";

                                    return (
                                        <span
                                            className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${
                                                paymentStatusClassMap[status] ?? paymentStatusClassMap.unpaid
                                            }`}
                                        >
                                            {status}
                                        </span>
                                    );
                                },
                            },
                            {
                                key: "created_at",
                                label: "Dibuat Pada",
                                sortKey: "created_at",
                                render: (item) => (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                                    </span>
                                ),
                            },
                            {
                                key: "created_by",
                                label: "Dibuat Oleh",
                                render: (item) => (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                                        {item.creator?.name ?? "-"}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </div>
            </section>
        </Layout>
    );
};

export default OrderIndex;
