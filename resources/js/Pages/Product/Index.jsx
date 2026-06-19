import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { TbEdit, TbEye, TbPhoto, TbTrash, TbCopyPlus } from "react-icons/tb";
import DataTable from "../../Components/DataTable";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";

const ProductIndex = ({ flash, products, filters }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, [dispatch]);

    return (
        <Layout flash={flash}>
            <Head>
                <title>Products | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">List of all products</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={products.data}
                        meta={products}
                        filters={filters}
                        routeName="product.index"
                        searchPlaceholder="Search by Product Name"
                        gridLayout="auto 0.5fr 1.5fr 1fr 1fr 2fr 1fr 1fr"
                        title="Products"
                        deleteType="product"
                        deleteDescription="Are you sure to delete this product?"
                        addHref={route("product.create")}
                        addLabel="Add Product"
                        toolbar={
                            <Link
                                href={route("product.bulkCreate")}
                                className="flex items-center gap-2 bg-sky-400 dark:bg-sky-500 text-white dark:text-slate-800 hover:bg-sky-500 dark:hover:bg-sky-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                            >
                                <TbCopyPlus className="font-bold text-xl" /> Bulk Add
                            </Link>
                        }
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
                                        <Link href={route("product.show", item.id)}>
                                            <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                        <Link href={route("product.edit", item.id)}>
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
                                key: "thumbnail",
                                label: "Thumbnail",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="flex justify-center"
                                    >
                                        {item.thumbnail ? (
                                            <img
                                                src={"/storage/" + item.thumbnail}
                                                className="w-10 h-10 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                                <TbPhoto className="text-slate-400 dark:text-slate-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "name",
                                label: "Name",
                                sortKey: "name",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="whitespace-normal font-medium"
                                    >
                                        {item.name}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "price",
                                label: "Price",
                                sortKey: "price",
                                render: (item) => (
                                    <motion.div
                                        className="whitespace-normal"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        Rp{item.price.toLocaleString("id-ID")}
                                    </motion.div>
                                ),
                            },
                            {
                                key: "stock",
                                label: "Stock",
                                sortKey: "stocks_sum_quantity",
                                render: (item) => {
                                    const currentStock = Number(item.stocks_sum_quantity ?? 0);
                                    const minimum = item.minimum === null || item.minimum === undefined ? null : Number(item.minimum);
                                    const isCritical = minimum !== null && currentStock < minimum;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <span
                                                className={`text-lg font-bold ${
                                                    isCritical ? "text-red-500" : "text-slate-700 dark:text-slate-200"
                                                }`}
                                            >
                                                {currentStock}
                                            </span>
                                            {minimum !== null ? (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                                        isCritical
                                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                                    }`}
                                                >
                                                    {isCritical ? `Stok Kritis < ${minimum}` : `Min ${minimum}`}
                                                </span>
                                            ) : null}
                                        </motion.div>
                                    );
                                },
                            },
                            {
                                key: "description",
                                label: "Description",
                                render: (item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="whitespace-normal text-slate-500 dark:text-slate-400"
                                    >
                                        {item.description ?? "-"}
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

export default ProductIndex;
