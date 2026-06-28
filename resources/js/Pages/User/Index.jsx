import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbEdit, TbTrash } from "react-icons/tb";
import DataTable from "../../Components/DataTable";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";

const UserIndex = ({ flash, users, filters }) => {
    const dispatch = useDispatch();
    const { auth } = usePage().props;
    const loggedInUser = auth?.user;

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "user", subRoute: null }));
    }, [dispatch]);

    const roleClassMap = {
        admin: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
        sales: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        customer: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Pengguna | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Pengguna</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Daftar semua pengguna</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={users.data}
                        meta={users}
                        filters={filters}
                        routeName="user.index"
                        searchPlaceholder="Cari Nama atau Email"
                        gridLayout="0.5fr 1.5fr 1.5fr 1fr 1fr 0.8fr"
                        title="Pengguna"
                        deleteType="user"
                        deleteDescription="Apakah Anda yakin ingin menghapus pengguna ini?"
                        addHref={route("user.create")}
                        addLabel="Tambah Pengguna"
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
                                        <Link href={route("user.edit", item.id)}>
                                            <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                        <TbTrash
                                            className={`text-3xl transition-all ${
                                                item.id === loggedInUser?.id
                                                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                                    : "text-slate-500 dark:text-slate-400 hover:text-red-500"
                                            }`}
                                            onClick={() => item.id !== loggedInUser?.id && onDelete(item.id)}
                                        />
                                    </motion.div>
                                ),
                            },
                            {
                                key: "name",
                                label: "Nama",
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
                                key: "email",
                                label: "Email",
                                sortKey: "email",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        {item.email}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "role",
                                label: "Peran",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        <span className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${roleClassMap[item.role]}`}>
                                            {item.role}
                                        </span>
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
                    />
                </div>
            </section>
        </Layout>
    );
};

export default UserIndex;
