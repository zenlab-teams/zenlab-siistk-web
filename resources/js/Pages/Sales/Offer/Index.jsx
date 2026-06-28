import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { TbEye } from "react-icons/tb";
import DataTable from "../../../Components/DataTable";
import Layout from "../../../Layouts/Default";
import Sidebar from "../../../Layouts/Sidebar";
import { setCurrentRoute } from "../../../Redux/slice";

const SalesOfferIndex = ({ flash, offers, filters }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "offer", subRoute: null }));
    }, [dispatch]);

    const statusClassMap = {
        active: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        completed: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
        rejected: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Penawaran | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Penawaran</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Penawaran yang ditugaskan ke Anda</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={offers.data}
                        meta={offers}
                        filters={filters}
                        routeName="sales.offer.index"
                        searchPlaceholder="Cari Nama Penawaran"
                        gridLayout="0.5fr 1.5fr 0.8fr 0.8fr 1fr 1fr 0.8fr"
                        selectable={false}
                        title="Penawaran"
                        columns={[
                            {
                                key: "actions",
                                label: "Aksi",
                                render: (item) => (
                                    <div className="flex justify-center">
                                        <Link href={route("sales.offer.show", item.id)}>
                                            <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                    </div>
                                ),
                            },
                            {
                                key: "name",
                                label: "Nama Penawaran",
                                sortKey: "name",
                                render: (item) => item.name,
                            },
                            {
                                key: "status",
                                label: "Status",
                                render: (item) => (
                                    <span
                                        className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${
                                            statusClassMap[item.status] ?? statusClassMap.active
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                ),
                            },
                            {
                                key: "items_count",
                                label: "Jumlah Item",
                                render: (item) => item.items_count ?? 0,
                            },
                            {
                                key: "date",
                                label: "Tgl Penawaran",
                                sortKey: "date",
                                render: (item) => new Date(item.date).toLocaleDateString("id-ID"),
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

export default SalesOfferIndex;
