import { Head, Link, useForm } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbPhoto, TbPlus, TbShoppingCart, TbTrash, TbX } from "react-icons/tb";
import DataTable from "../../../Components/DataTable";
import NumberInput from "../../../Components/input/NumberInput";
import SelectInput from "../../../Components/input/SelectInput";
import TextAreaInput from "../../../Components/input/TextAreaInput";
import Layout from "../../../Layouts/Default";
import Sidebar from "../../../Layouts/Sidebar";
import { setCurrentRoute } from "../../../Redux/slice";
import ModalCreateSaleRecord from "../../../Components/modal/ModalCreateSaleRecord";

const statusOfferClassMap = {
    active: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    completed: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
    rejected: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

const statusRecordClassMap = {
    pending: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
    approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

const createEmptyRecordItem = () => ({
    product_id: null,
    quantity: 1,
    sold_price: 0,
});

const SalesOfferShow = ({ flash, offer, customers, currentSaleId }) => {
    const dispatch = useDispatch();
    const [showRecordForm, setShowRecordForm] = useState(false);
    const [domReady, setDomReady] = useState(false);

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "offer", subRoute: null }));
    }, [dispatch]);

    useEffect(() => {
        setDomReady(true);
    }, []);

    const modalRoot = domReady ? document.getElementById("modal-root") : null;

    const items = offer.items ?? [];
    const records = offer.records ?? [];

    const salesNames = (offer.offer_sales ?? [])
        .map((offerSale) => offerSale.sale?.user?.name)
        .filter((name) => Boolean(name));

    const offerTotal = items.reduce((total, item) => total + Number(item.subtotal ?? 0), 0);

    const saleOptions = (offer.offer_sales ?? []).map((offerSale) => ({
        value: offerSale.sale_id,
        label: offerSale.sale?.user?.name ?? "-",
    }));

    const customerOptions = [
        { value: null, label: "Walk-in" },
        ...customers.map((customer) => ({
            value: customer.id,
            label: customer.name,
        })),
    ];

    const offeredPriceMap = Object.fromEntries(
        items.map((item) => [item.product_id, Number(item.offered_price ?? 0)])
    );

    const soldQuantities = records.reduce((acc, record) => {
        if (record.status === "rejected") return acc;
        (record.items ?? []).forEach((item) => {
            acc[item.product_id] = (acc[item.product_id] ?? 0) + Number(item.quantity ?? 0);
        });
        return acc;
    }, {});

    const remainingStockMap = Object.fromEntries(
        items.map((item) => [
            item.product_id,
            item.quantity - (soldQuantities[item.product_id] ?? 0),
        ])
    );

    const productOptions = items.map((item) => ({
        value: item.product_id,
        label: item.product?.name ?? "-",
        stock: remainingStockMap[item.product_id] ?? 0,
        targetPrice: Number(item.offered_price ?? 0),
    }));

    // Redundant form logic removed as it's now in ModalCreateSaleRecord

    // recordModal logic removed as it's now handled by ModalCreateSaleRecord component

    return (
        <>
            <ModalCreateSaleRecord 
                isOpen={showRecordForm}
                onClose={() => setShowRecordForm(false)}
                offer={offer}
                saleOptions={saleOptions}
                customerOptions={customerOptions}
                productOptions={productOptions}
                remainingStockMap={remainingStockMap}
                flash={flash}
                saleId={currentSaleId}
                routeName="sales.offer.record.store"
            />
            <Layout flash={flash}>
            <Head>
                <title>Offer Detail | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold">{offer.name}</h1>
                            <span
                                className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${
                                    statusOfferClassMap[offer.status] ?? statusOfferClassMap.active
                                }`}
                            >
                                {offer.status}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Offer details and your sale reports</p>
                    </div>

                    <Link
                        href={route("sales.offer.index")}
                        className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                    >
                        <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
                    <p className="text-xl font-bold mb-3">Info Offer</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Nama Penawaran</p>
                            <p className="text-lg font-bold">{offer.name}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Tanggal</p>
                            <p className="text-lg font-bold">{new Date(offer.date).toLocaleDateString("id-ID")}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Deskripsi</p>
                            <p className="text-base">{offer.description ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Sales Ditugaskan</p>
                            <p className="text-base">{salesNames.length > 0 ? salesNames.join(", ") : "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
                    <DataTable
                        nodes={items}
                        paginated={false}
                        selectable={false}
                        gridLayout="auto 1.5fr 0.5fr 1fr"
                        title="Items Dibawa"
                        columns={[
                            {
                                key: "thumbnail",
                                label: "Thumbnail",
                                render: (item) =>
                                    item.product?.thumbnail ? (
                                        <img
                                            src={`/storage/${item.product.thumbnail}`}
                                            className="w-12 h-12 object-cover rounded-lg mx-auto"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto">
                                            <TbPhoto className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                    ),
                            },
                            {
                                key: "name",
                                label: "Nama Produk",
                                render: (item) => item.product?.name ?? "-",
                            },
                            {
                                key: "quantity",
                                label: "Qty Dibawa",
                                render: (item) => item.quantity,
                            },
                            {
                                key: "offered_price",
                                label: "Harga Target",
                                render: (item) => `Rp${Number(item.offered_price ?? 0).toLocaleString("id-ID")}`,
                            },
                        ]}
                    />

                    <div className="mt-4 flex justify-end">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 min-w-72">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Target</span>
                                <span>Rp{offerTotal.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl mb-5">
                    <DataTable
                        nodes={records}
                        paginated={false}
                        selectable={false}
                        gridLayout="0.5fr 1fr 1fr 2fr 1fr 0.8fr"
                        title="Sale Records"
                        toolbar={
                            offer.status === "active" ? (
                                <button
                                    type="button"
                                    onClick={() => setShowRecordForm(true)}
                                    className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-4 py-2 rounded-lg font-bold transition-all"
                                >
                                    Tambah Laporan Penjualan
                                </button>
                            ) : null
                        }
                        rowClassName={(record) => {
                            const isMyRecord = Number(record.sale_id) === Number(currentSaleId);

                            return isMyRecord
                                ? "dark:!bg-slate-800 bg-sky-50 dark:!bg-sky-900/20 transition-all"
                                : "dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all";
                        }}
                        columns={[
                            {
                                key: "action",
                                label: "Action",
                                cellClassName: "!items-start !p-3",
                                render: (record) => (
                                    <div className="flex gap-2 items-center">
                                        {record.order && (
                                            <Link
                                                href={route("order.show", record.order.id)}
                                                className="text-slate-500 hover:text-sky-500 transition-all"
                                                title="Lihat Order"
                                            >
                                                <TbShoppingCart className="text-3xl" />
                                            </Link>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: "customer",
                                label: "Customer",
                                cellClassName: "!items-start !p-3",
                                render: (record) =>
                                    record.customer?.name ?? (
                                        <span className="italic text-slate-400 dark:text-slate-500">Walk-in</span>
                                    ),
                            },
                            {
                                key: "sales",
                                label: "Sales",
                                cellClassName: "!items-start !p-3",
                                render: (record) => record.sale?.user?.name ?? "-",
                            },
                            {
                                key: "items",
                                label: "Items",
                                cellClassName: "!items-start !p-3",
                                render: (record) => (
                                    <div className="flex flex-col gap-1 w-full">
                                        {(record.items ?? []).map((item, idx) => (
                                            <div key={idx} className="text-xs flex justify-between gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-1 last:border-0">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {item.product?.name} ({item.quantity}x @ Rp{Number(item.sold_price ?? 0).toLocaleString("id-ID")})
                                                </span>
                                                <span className="font-bold whitespace-nowrap">
                                                    Rp{Number(item.subtotal ?? 0).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ),
                            },
                            {
                                key: "total",
                                label: "Total",
                                cellClassName: "!items-start !p-3",
                                render: (record) =>
                                    `Rp${(record.items ?? [])
                                        .reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0)
                                        .toLocaleString("id-ID")}`,
                            },
                            {
                                key: "status",
                                label: "Status",
                                cellClassName: "!items-start !p-3",
                                render: (record) => (
                                    <span
                                        className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${
                                            statusRecordClassMap[record.status] ?? statusRecordClassMap.pending
                                        }`}
                                    >
                                        {record.status}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </div>
            </section>
            </Layout>
        </>
    );
};

export default SalesOfferShow;
