import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbEdit, TbTrash } from "react-icons/tb";
import DataTable from "../../Components/DataTable";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";

const Customer = ({ flash, customers, filters }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "customer", subRoute: null }));
    }, [dispatch]);

    return (
        <Layout flash={flash}>
            <Head>
                <title>Pelanggan | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Pelanggan</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Daftar Semua Pelanggan</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={customers.data}
                        meta={customers}
                        filters={filters}
                        routeName="customer.index"
                        searchPlaceholder="Cari Nama Pelanggan"
                        gridLayout="0.5fr 1fr 1fr 1fr 0.5fr 0.8fr 0.8fr"
                        title="Pelanggan"
                        deleteType="customer"
                        deleteDescription="Apakah Anda yakin ingin menghapus pelanggan ini?"
                        addHref={route("customer.create")}
                        addLabel="Tambah Pelanggan"
                        columns={[
                            {
                                key: "actions",
                                label: "Aksi",
                                render: (item, { onDelete }) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="flex gap-3 justify-center"
                                    >
                                        <Link href={route("customer.edit", item.id)}>
                                            <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                        <TbTrash
                                            className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                            onClick={() => onDelete(item.id)}
                                        />
                                    </motion.div>
                                ),
                            },
                            {
                                key: "customer",
                                label: "Pelanggan",
                                sortKey: "name",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        {item.name}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "address",
                                label: "Alamat",
                                render: (item) => (
                                    <motion.div
                                        className="whitespace-normal"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        {item.address}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "contact",
                                label: "Kontak",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="flex flex-col"
                                    >
                                        <span className="text-lg">{item.email}</span>
                                        <span className="text-sm text-slate-500">{item.number_phone}</span>
                                    </motion.div>
                                ),
                            },
                            {
                                key: "total_order",
                                label: "Total Pesanan",
                                render: () => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        0
                                    </motion.div>
                                ),
                            },
                            {
                                key: "created_at",
                                label: "Dibuat Pada",
                                sortKey: "created_at",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="text-slate-500 dark:text-slate-400 text-sm"
                                    >
                                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "created_by",
                                label: "Dibuat Oleh",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="text-slate-500 dark:text-slate-400 text-sm"
                                    >
                                        {item.creator?.name ?? "-"}
                                    </motion.div>
                                ),
                            },
                        ]}
                    >
                    </DataTable>
                </div>
            </section>
        </Layout>
    );
};

export default Customer;
