import { Head, Link, useForm } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";
import { TbDownload, TbPhoto, TbPlus, TbX, TbCheck } from "react-icons/tb";
import { Body, Cell, Header, HeaderCell, HeaderRow, Row, Table } from "@table-library/react-table-library/table";
import { AnimatePresence, motion } from "framer-motion";
import { tableStyle } from "../../../config/tableConfig";
import NumberInput from "../../../Components/input/NumberInput";
import SelectInput from "../../../Components/input/SelectInput";
import TextInput from "../../../Components/input/TextInput";
import ImageInput from "../../../Components/input/ImageInput";

const PublicOrderShow = ({ order, flash }) => {
    const invoice = order.invoice;
    const items = order.items ?? [];
    const payments = invoice?.payments ?? [];
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const orderStatusClassMap = {
        completed: "bg-emerald-100 text-emerald-600",
        pending: "bg-slate-100 text-slate-500",
        cancelled: "bg-red-100 text-red-500",
        expired: "bg-orange-100 text-orange-500",
    };

    const invoiceStatusClassMap = {
        unpaid: "bg-red-100 text-red-500",
        partial: "bg-orange-100 text-orange-500",
        paid: "bg-emerald-100 text-emerald-600",
    };

    const paymentTypeClassMap = {
        dp: "bg-sky-100 text-sky-600",
        installment: "bg-orange-100 text-orange-500",
        full: "bg-emerald-100 text-emerald-600",
    };

    const paymentStatusClassMap = {
        pending: "bg-slate-100 text-slate-500 italic",
        approved: "bg-emerald-100 text-emerald-600 font-bold",
        rejected: "bg-red-100 text-red-500 font-bold",
    };

    const itemTableTheme = tableStyle("auto 1.5fr 0.5fr 1fr 1fr", "order-table");
    const paymentTableTheme = tableStyle("1.2fr 0.9fr 1fr 1fr 1.5fr", "order-table");

    const itemData = useMemo(() => ({ nodes: items }), [items]);
    const paymentData = useMemo(() => ({ nodes: payments }), [payments]);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: 0,
        type: "full",
        proof_image: null,
        note: "",
    });

    useEffect(() => {
        if (data.type === "full" && invoice) {
            setData("amount", invoice.remaining_amount);
        }
    }, [data.type, invoice?.remaining_amount]);

    const handleSubmitPayment = (event) => {
        event.preventDefault();
        post(route("order.public.payment.store", order.uuid), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowPaymentModal(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 relative">
            <Head>
                <title>Order Details | TelatenKarya</title>
            </Head>

            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                        />

                        <motion.div
                            className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
                                <div>
                                    <p className="text-xl font-bold text-slate-800">Confirm Payment</p>
                                    <p className="text-sm text-slate-500">Upload your payment proof for verification</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="rounded-xl p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-600 shadow-sm"
                                >
                                    <TbX className="text-xl" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmitPayment} className="flex flex-col gap-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <NumberInput
                                            name="amount"
                                            label="Amount Paid"
                                            type="currency"
                                            value={data.amount}
                                            min={1}
                                            onChange={setData}
                                            error={errors.amount}
                                            required={true}
                                            disabled={data.type === "full"}
                                        />
                                        <SelectInput
                                            name="type"
                                            label="Payment Type"
                                            options={[
                                                { value: "dp", label: "DP / Down Payment" },
                                                { value: "installment", label: "Installment" },
                                                { value: "full", label: "Full Payment" },
                                            ]}
                                            value={data.type}
                                            onChange={setData}
                                            error={errors.type}
                                            required={true}
                                        />
                                    </div>
                                    <TextInput
                                        name="note"
                                        label="Note (Optional)"
                                        placeholder="e.g. Payment via BCA Transfer"
                                        value={data.note}
                                        onChange={setData}
                                        error={errors.note}
                                    />
                                    <ImageInput
                                        name="proof_image"
                                        label="Payment Proof (Image)"
                                        placeholder="Click to upload receipt"
                                        value={data.proof_image}
                                        onChange={setData}
                                        error={errors.proof_image}
                                        required={true}
                                    />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/25"
                                        >
                                            {processing ? "Submitting..." : "Submit Payment Proof"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto">
                {flash?.success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3"
                    >
                        <div className="bg-emerald-500 text-white p-1 rounded-full">
                            <TbCheck className="text-sm" />
                        </div>
                        <p className="font-medium">{flash.success}</p>
                    </motion.div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-800">Order #{order.id}</h1>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${orderStatusClassMap[order.status] ?? orderStatusClassMap.pending}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-slate-500">Official order summary and payment status</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <a
                            href={route("order.invoice.download", order.id)}
                            target="_blank"
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <TbDownload className="text-xl" /> Download Invoice
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl lg:col-span-2">
                        <p className="text-lg font-bold mb-4 text-slate-800">Order Information</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Date Issued</p>
                                <p className="font-semibold">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Amount</p>
                                <p className="font-bold text-sky-600">Rp{order.total_price.toLocaleString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Sales Person</p>
                                <p className="font-semibold">{order.offerRecord?.sale?.user?.name ?? order.creator?.name ?? "-"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl">
                        <p className="text-lg font-bold mb-4 text-slate-800">Customer</p>
                        {order.customer ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Name</p>
                                    <p className="font-semibold text-slate-700">{order.customer.name}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {order.customer.phone && (
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Phone</p>
                                            <p className="font-semibold text-slate-700">{order.customer.phone}</p>
                                        </div>
                                    )}
                                    {order.customer.email && (
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Email</p>
                                            <p className="font-semibold text-slate-700">{order.customer.email}</p>
                                        </div>
                                    )}
                                </div>
                                {order.customer.address && (
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Address</p>
                                        <p className="font-semibold text-slate-700 leading-relaxed">{order.customer.address}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="italic text-slate-400">Walk-in Customer</p>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl mb-8">
                    <p className="text-lg font-bold mb-4 text-slate-800">Purchased Items</p>
                    <div className="overflow-x-auto">
                        <Table data={itemData} theme={itemTableTheme} layout={{ custom: true }}>
                            {(tableList) => (
                                <>
                                    <Header>
                                        <HeaderRow className="!bg-slate-50 text-slate-500">
                                            <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Image</HeaderCell>
                                            <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Product</HeaderCell>
                                            <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Qty</HeaderCell>
                                            <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Unit Price</HeaderCell>
                                            <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Subtotal</HeaderCell>
                                        </HeaderRow>
                                    </Header>
                                    <Body>
                                        {tableList.map((item) => (
                                            <Row key={item.id} item={item} className="hover:bg-slate-50 transition-all border-b border-slate-100">
                                                <Cell className="!p-4">
                                                    {item.product?.thumbnail ? (
                                                        <img src={`/storage/${item.product.thumbnail}`} className="w-12 h-12 object-cover rounded-xl" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                            <TbPhoto className="text-slate-300 text-xl" />
                                                        </div>
                                                    )}
                                                </Cell>
                                                <Cell className="!p-4 font-semibold text-slate-700">{item.product?.name ?? "-"}</Cell>
                                                <Cell className="!p-4 text-slate-600">{item.quantity}</Cell>
                                                <Cell className="!p-4 text-slate-600">Rp{item.price.toLocaleString("id-ID")}</Cell>
                                                <Cell className="!p-4 font-bold text-slate-800">Rp{item.subtotal.toLocaleString("id-ID")}</Cell>
                                            </Row>
                                        ))}
                                    </Body>
                                </>
                            )}
                        </Table>
                    </div>
                </div>

                {invoice && (
                    <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <p className="text-lg font-bold text-slate-800">Invoice Status</p>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${invoiceStatusClassMap[invoice.status] ?? invoiceStatusClassMap.unpaid}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            {invoice.status !== "paid" && order.status !== "cancelled" && (
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20"
                                >
                                    <TbPlus className="text-xl" /> Add Payment
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Bill</p>
                                <p className="font-bold text-2xl text-slate-800">Rp{invoice.total_amount.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                                <p className="text-emerald-600/60 text-xs uppercase font-bold tracking-wider mb-1">Amount Paid</p>
                                <p className="font-bold text-2xl text-emerald-600">Rp{invoice.paid_amount.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                                <p className="text-orange-600/60 text-xs uppercase font-bold tracking-wider mb-1">Remaining</p>
                                <p className="font-bold text-2xl text-orange-600">Rp{invoice.remaining_amount.toLocaleString("id-ID")}</p>
                            </div>
                        </div>

                        {payments.length > 0 && (
                            <div className="mt-8">
                                <p className="text-lg font-bold mb-4 text-slate-800">Payment History</p>
                                <div className="overflow-x-auto">
                                    <Table data={paymentData} theme={paymentTableTheme} layout={{ custom: true }}>
                                        {(tableList) => (
                                            <>
                                                <Header>
                                                    <HeaderRow className="!bg-slate-50 text-slate-500">
                                                        <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Date</HeaderCell>
                                                        <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Type</HeaderCell>
                                                        <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Amount</HeaderCell>
                                                        <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Proof</HeaderCell>
                                                        <HeaderCell className="!py-3 !px-4 font-bold uppercase text-xs">Status</HeaderCell>
                                                    </HeaderRow>
                                                </Header>
                                                <Body>
                                                    {tableList.map((payment) => (
                                                        <Row key={payment.id} item={payment} className="border-b border-slate-100">
                                                            <Cell className="!p-4 text-slate-600 text-sm">
                                                                {new Date(payment.created_at).toLocaleString("id-ID")}
                                                            </Cell>
                                                            <Cell className="!p-4">
                                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${paymentTypeClassMap[payment.type] ?? paymentTypeClassMap.full}`}>
                                                                    {payment.type}
                                                                </span>
                                                            </Cell>
                                                            <Cell className="!p-4 font-bold text-slate-700">Rp{payment.amount.toLocaleString("id-ID")}</Cell>
                                                            <Cell className="!p-4">
                                                                {payment.proof_image ? (
                                                                    <a href={`/storage/${payment.proof_image}`} target="_blank" className="text-sky-500 font-bold hover:underline">View</a>
                                                                ) : "-"}
                                                            </Cell>
                                                            <Cell className="!p-4">
                                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${paymentStatusClassMap[payment.status]}`}>
                                                                    {payment.status}
                                                                </span>
                                                            </Cell>
                                                        </Row>
                                                    ))}
                                                </Body>
                                            </>
                                        )}
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center py-8">
                    <p className="text-slate-400 text-sm italic">Thank you for choosing TelatenKarya SIISTK</p>
                </div>
            </div>
        </div>
    );
};

export default PublicOrderShow;
