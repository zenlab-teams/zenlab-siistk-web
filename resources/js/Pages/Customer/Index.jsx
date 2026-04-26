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
                <title>Customer | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Customer</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">List of All The Customer</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={customers.data}
                        meta={customers}
                        filters={filters}
                        routeName="customer.index"
                        searchPlaceholder="Search by Customer Name"
                        gridLayout="0.5fr 1fr 1fr 1fr 0.5fr 0.8fr 0.8fr"
                        title="Customers"
                        deleteType="customer"
                        deleteDescription="Are you sure to delete this customer?"
                        addHref={route("customer.create")}
                        addLabel="Add Customer"
                        columns={[
                            {
                                key: "actions",
                                label: "Action",
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
                                label: "Customer",
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
                                label: "Address",
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
                                label: "Contact",
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
                                label: "Total Order",
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
                                label: "Created At",
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
                                label: "Created By",
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
