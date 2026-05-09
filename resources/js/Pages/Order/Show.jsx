import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Body, Cell, Header, HeaderCell, HeaderRow, Row, Table } from "@table-library/react-table-library/table";
import ImageInput from "../../Components/input/ImageInput";
import NumberInput from "../../Components/input/NumberInput";
import SelectInput from "../../Components/input/SelectInput";
import TextInput from "../../Components/input/TextInput";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";
import { tableStyle } from "../../config/tableConfig";

const OrderShow = ({ flash, order }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "order", subRoute: null }));
    }, [dispatch]);

    const invoice = order.invoice;
    const items = order.items ?? [];
    const payments = invoice?.payments ?? [];

    const orderStatusClassMap = {
        completed: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        pending: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
        cancelled: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
        expired: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
    };

    const invoiceStatusClassMap = {
        unpaid: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
        partial: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
        paid: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    };

    const paymentTypeClassMap = {
        dp: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
        installment: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
        full: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    };

    const itemTableTheme = tableStyle("auto 1.5fr 0.5fr 1fr 1fr", "order-table");
    const paymentTableTheme = tableStyle("1.2fr 0.9fr 1fr 0.8fr 1.5fr 1fr", "order-table");

    const itemData = useMemo(() => ({ nodes: items }), [items]);
    const paymentData = useMemo(() => ({ nodes: payments }), [payments]);

    const paymentTypeOptions = [
        { value: "dp", label: "DP" },
        { value: "installment", label: "Installment" },
        { value: "full", label: "Full" },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: 0,
        type: "full",
        proof_image: null,
        note: "",
    });

    const handleCancelOrder = () => {
        router.patch(route("order.cancel", order.id));
    };

    const handleSubmitPayment = (event) => {
        event.preventDefault();

        if (!invoice?.id) {
            return;
        }

        post(route("invoice.payment.store", invoice.id), {
            forceFormData: true,
            onSuccess: () => {
                reset("amount", "type", "proof_image", "note");
            },
        });
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Order Detail | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                            <span
                                className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${
                                    orderStatusClassMap[order.status] ?? orderStatusClassMap.pending
                                }`}
                            >
                                {order.status}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Order details, invoice, and payment history</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {order.status === "pending" && (
                            <button
                                type="button"
                                onClick={handleCancelOrder}
                                className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-4 py-2 rounded-lg font-bold transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <Link
                            href={route("order.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
                    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl xl:col-span-2">
                        <p className="text-xl font-bold mb-3">Order Information</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Customer</p>
                                <p className="text-lg font-bold">
                                    {order.customer?.name ?? <span className="italic text-slate-400">Walk-in</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Created At</p>
                                <p className="text-lg font-bold">{new Date(order.created_at).toLocaleString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Status</p>
                                <span
                                    className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold capitalize ${
                                        orderStatusClassMap[order.status] ?? orderStatusClassMap.pending
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Total</p>
                                <p className="text-lg font-bold">Rp{order.total_price.toLocaleString("id-ID")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                        <p className="text-xl font-bold mb-3">Created By</p>
                        <p className="text-lg">{order.creator?.name ?? "-"}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xl font-bold">Items</p>
                        <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 px-3 py-1 rounded-lg text-sm">
                            {items.length} items
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[850px]">
                            <Table
                                data={itemData}
                                className="text-lg mt-3 !table-fixed !border-b-2 dark:border-slate-600"
                                theme={itemTableTheme}
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
                                                    Thumbnail
                                                </HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Product</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Qty</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Unit Price</HeaderCell>
                                                <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                    Subtotal
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
                                                            {item.product?.thumbnail ? (
                                                                <img
                                                                    src={`/storage/${item.product.thumbnail}`}
                                                                    className="w-12 h-12 object-cover rounded-lg mx-auto"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </Cell>
                                                        <Cell className="!p-3">{item.product?.name ?? "-"}</Cell>
                                                        <Cell className="!p-3">{item.quantity}</Cell>
                                                        <Cell className="!p-3">Rp{item.price.toLocaleString("id-ID")}</Cell>
                                                        <Cell className="!p-3">Rp{item.subtotal.toLocaleString("id-ID")}</Cell>
                                                    </Row>
                                                ))
                                            ) : (
                                                <Cell
                                                    gridColumnStart={1}
                                                    gridColumnEnd={100}
                                                    className="text-center py-16 text-slate-400 dark:text-slate-500"
                                                >
                                                    No order items found.
                                                </Cell>
                                            )}
                                        </Body>
                                    </>
                                )}
                            </Table>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 min-w-72">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>Rp{order.total_price.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {invoice ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div className="xl:col-span-2 bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xl font-bold">Invoice & Payments</p>
                                <span
                                    className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${
                                        invoiceStatusClassMap[invoice.status] ?? invoiceStatusClassMap.unpaid
                                    }`}
                                >
                                    {invoice.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Total Amount</p>
                                    <p className="font-bold text-lg">Rp{invoice.total_amount.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Due Date</p>
                                    <p className="font-bold text-lg">
                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("id-ID") : "-"}
                                    </p>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Paid Amount</p>
                                    <p className="font-bold text-lg">Rp{invoice.paid_amount.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Remaining Amount</p>
                                    <p className="font-bold text-lg">Rp{invoice.remaining_amount.toLocaleString("id-ID")}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="min-w-[900px]">
                                    <Table
                                        data={paymentData}
                                        className="text-lg mt-3 !table-fixed !border-b-2 dark:border-slate-600"
                                        theme={paymentTableTheme}
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
                                                        <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Amount</HeaderCell>
                                                        <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Proof</HeaderCell>
                                                        <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Note</HeaderCell>
                                                        <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                            Created By
                                                        </HeaderCell>
                                                    </HeaderRow>
                                                </Header>
                                                <Body>
                                                    {tableList.length > 0 ? (
                                                        tableList.map((payment) => (
                                                            <Row
                                                                key={payment.id}
                                                                item={payment}
                                                                className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 transition-all"
                                                            >
                                                                <Cell className="!p-3 text-sm">
                                                                    {new Date(payment.created_at).toLocaleString("id-ID")}
                                                                </Cell>
                                                                <Cell className="!p-3">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${
                                                                            paymentTypeClassMap[payment.type] ?? paymentTypeClassMap.full
                                                                        }`}
                                                                    >
                                                                        {payment.type}
                                                                    </span>
                                                                </Cell>
                                                                <Cell className="!p-3">Rp{payment.amount.toLocaleString("id-ID")}</Cell>
                                                                <Cell className="!p-3">
                                                                    {payment.proof_image ? (
                                                                        <a
                                                                            href={`/storage/${payment.proof_image}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-sky-500 hover:text-sky-600 font-bold"
                                                                        >
                                                                            View
                                                                        </a>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </Cell>
                                                                <Cell className="!p-3">{payment.note ?? "-"}</Cell>
                                                                <Cell className="!p-3">{payment.creator?.name ?? "-"}</Cell>
                                                            </Row>
                                                        ))
                                                    ) : (
                                                        <Cell
                                                            gridColumnStart={1}
                                                            gridColumnEnd={100}
                                                            className="text-center py-10 text-slate-400 dark:text-slate-500"
                                                        >
                                                            No payment records yet.
                                                        </Cell>
                                                    )}
                                                </Body>
                                            </>
                                        )}
                                    </Table>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl h-fit">
                            <p className="text-xl font-bold mb-3">Add Payment</p>
                            <form onSubmit={handleSubmitPayment} className="flex flex-col gap-3">
                                <NumberInput
                                    name="amount"
                                    label="Amount"
                                    value={data.amount}
                                    min={1}
                                    onChange={setData}
                                    error={errors.amount}
                                    required={true}
                                />
                                <SelectInput
                                    name="type"
                                    label="Type"
                                    options={paymentTypeOptions}
                                    value={data.type}
                                    onChange={setData}
                                    error={errors.type}
                                    required={true}
                                />
                                <TextInput
                                    name="note"
                                    label="Note"
                                    placeholder="Add note (optional)"
                                    value={data.note}
                                    onChange={setData}
                                    error={errors.note}
                                />
                                <ImageInput
                                    name="proof_image"
                                    label="Proof Image"
                                    placeholder="Upload payment proof"
                                    value={data.proof_image}
                                    onChange={setData}
                                    error={errors.proof_image}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    {processing ? "Saving..." : "Save Payment"}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl text-slate-500 dark:text-slate-400">
                        Invoice not found for this order.
                    </div>
                )}
            </section>
        </Layout>
    );
};

export default OrderShow;
