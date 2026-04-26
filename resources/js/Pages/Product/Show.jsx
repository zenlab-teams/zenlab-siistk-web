import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { TbPhoto, TbPlus } from "react-icons/tb";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { motion } from "framer-motion";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";
import { tableStyle } from "../../config/tableConfig";

const ProductShow = ({ flash, product, stocks, currentStock }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "detail" }));
    }, [dispatch]);

    const tableTheme = tableStyle("1.2fr 0.8fr 0.7fr 1fr 2fr", "order-table");
    const data = useMemo(() => ({ nodes: stocks }), [stocks]);

    const typeBadgeClass = (type) => {
        if (type === "in") {
            return "bg-emerald-200 text-emerald-600 dark:bg-emerald-500 dark:bg-opacity-20 dark:text-emerald-400";
        }

        if (type === "out") {
            return "bg-red-200 text-red-600 dark:bg-red-500 dark:bg-opacity-20 dark:text-red-400";
        }

        return "bg-yellow-200 text-yellow-600 dark:bg-yellow-500 dark:bg-opacity-20 dark:text-yellow-400";
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Product Detail | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 px-3 py-1 rounded-lg text-base">
                                Stock: {currentStock}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Product details and stock history</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("product.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                        <Link
                            href={route("product.stock.create", product.id)}
                            className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <TbPlus className="font-bold text-xl" /> Add Stock
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="w-full h-64 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                            {product.thumbnail ? (
                                <img src={"/storage/" + product.thumbnail} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                    <TbPhoto className="text-7xl mb-2" />
                                    <span>No Thumbnail</span>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-3">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                                <p className="text-2xl font-bold">{product.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                                <p className="text-xl font-bold">Rp{product.price.toLocaleString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Description</p>
                                <p className="text-base whitespace-pre-line">{product.description ?? "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xl font-bold">Stock History</p>
                        <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 px-3 py-1 rounded-lg text-sm">
                            {stocks.length} entries
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table
                                data={data}
                                className="text-lg mt-3 !table-fixed !border-b-2 dark:border-slate-600"
                                theme={tableTheme}
                                layout={{ custom: true }}
                            >
                                {(tableList) => (
                                    <>
                                        <Header>
                                            <HeaderRow
                                                className="!bg-slate-100 dark:!bg-slate-700 text-slate-500 dark:text-slate-400"
                                                layout={{ custom: true }}
                                            >
                                                <HeaderCell className="border-s-2 border-y-2 rounded-s-xl !py-2 !px-3 dark:border-slate-600">
                                                    Date
                                                </HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Type</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Quantity</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Unit Cost</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                    Note
                                                </HeaderCell>
                                            </HeaderRow>
                                        </Header>
                                        <Body>
                                            {tableList.length > 0 ? (
                                                tableList.map((item) => (
                                                    <Row
                                                        key={item.id}
                                                        item={item}
                                                        className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 transition-all"
                                                    >
                                                        <Cell className="!p-3">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                                className="text-sm"
                                                            >
                                                                {new Date(item.created_at).toLocaleString("id-ID")}
                                                            </motion.div>
                                                        </Cell>
                                                        <Cell className="!p-3">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                            >
                                                                <span className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${typeBadgeClass(item.type)}`}>
                                                                    {item.type}
                                                                </span>
                                                            </motion.div>
                                                        </Cell>
                                                        <Cell className="!p-3">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                                className="font-bold"
                                                            >
                                                                {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                                                            </motion.div>
                                                        </Cell>
                                                        <Cell className="!p-3">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                            >
                                                                {item.unit_cost !== null ? `Rp${item.unit_cost.toLocaleString("id-ID")}` : "-"}
                                                            </motion.div>
                                                        </Cell>
                                                        <Cell className="!p-3">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                                className="whitespace-normal"
                                                            >
                                                                {item.note ?? "-"}
                                                            </motion.div>
                                                        </Cell>
                                                    </Row>
                                                ))
                                            ) : (
                                                <Cell
                                                    gridColumnStart={1}
                                                    gridColumnEnd={100}
                                                    className="text-center py-16 text-slate-400 dark:text-slate-500"
                                                >
                                                    No stock history found.
                                                </Cell>
                                            )}
                                        </Body>
                                    </>
                                )}
                            </Table>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ProductShow;
