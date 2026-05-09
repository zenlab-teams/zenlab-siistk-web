import { Head, Link, useForm } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbPhoto, TbPlus, TbTrash, TbX } from "react-icons/tb";
import DataTable from "../../../Components/DataTable";
import NumberInput from "../../../Components/input/NumberInput";
import SelectInput from "../../../Components/input/SelectInput";
import TextAreaInput from "../../../Components/input/TextAreaInput";
import Layout from "../../../Layouts/Default";
import Sidebar from "../../../Layouts/Sidebar";
import { setCurrentRoute } from "../../../Redux/slice";

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

    const customerOptions = customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
    }));

    const productOptions = items.map((item) => ({
        value: item.product_id,
        label: item.product?.name ?? "-",
    }));

    const offeredPriceMap = Object.fromEntries(
        items.map((item) => [item.product_id, Number(item.offered_price ?? 0)])
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: null,
        notes: "",
        items: [],
    });

    const addRecordItem = () => {
        setData("items", [...data.items, createEmptyRecordItem()]);
    };

    const removeRecordItem = (index) => {
        setData(
            "items",
            data.items.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const updateRecordItem = (index, patch) => {
        const nextItems = [...data.items];
        nextItems[index] = { ...nextItems[index], ...patch };
        setData("items", nextItems);
    };

    const handleRecordProductChange = (index, productId) => {
        updateRecordItem(index, {
            product_id: productId ? Number(productId) : null,
        });
    };

    const handleRecordQtyChange = (index, value) => {
        updateRecordItem(index, {
            quantity: Math.max(1, Number(value) || 1),
        });
    };

    const handleRecordPriceChange = (index, value) => {
        updateRecordItem(index, {
            sold_price: Math.max(0, Number(value) || 0),
        });
    };

    const handleSubmitRecord = (event) => {
        event.preventDefault();
        post(route("sales.offer.record.store", offer.id), {
            onSuccess: () => {
                reset("customer_id", "notes", "items");
                setShowRecordForm(false);
            },
        });
    };

    const recordTotal = data.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0) * (Number(item.sold_price) || 0);
    }, 0);

    const recordError = (index, field) => errors[`items.${index}.${field}`];

    const recordModal = domReady && modalRoot
        ? createPortal(
              <AnimatePresence>
                  {showRecordForm && (
                      <motion.div
                          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                      >
                          <motion.div
                              className="fixed inset-0 bg-black/30 dark:bg-black/50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowRecordForm(false)}
                          />

                          <motion.div
                              className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-xl dark:bg-slate-800"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                          >
                              <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
                                  <p className="text-xl font-bold">Tambah Laporan Penjualan</p>
                                  <button
                                      type="button"
                                      onClick={() => setShowRecordForm(false)}
                                      className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                      <TbX className="text-xl" />
                                  </button>
                              </div>

                              <div className="p-5">
                                  <form onSubmit={handleSubmitRecord} className="flex flex-col gap-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <SelectInput
                                              name="customer_id"
                                              label="Customer"
                                              placeholder="Pilih customer (opsional)"
                                              options={customerOptions}
                                              value={data.customer_id}
                                              onChange={setData}
                                              error={errors.customer_id}
                                          />
                                          <TextAreaInput
                                              name="notes"
                                              label="Notes"
                                              placeholder="Catatan tambahan (opsional)"
                                              value={data.notes}
                                              onChange={setData}
                                              error={errors.notes}
                                          />
                                      </div>

                                      <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                              <p className="text-lg font-bold">Items Laporan</p>
                                              <button
                                                  type="button"
                                                  onClick={addRecordItem}
                                                  className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all"
                                              >
                                                  <TbPlus className="text-xl" /> Add Item
                                              </button>
                                          </div>

                                          {errors.items && <p className="text-red-400 font-bold mb-3">{errors.items}</p>}

                                          <div className="flex flex-col gap-3">
                                              {data.items.length === 0 && (
                                                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                                                      Belum ada item laporan.
                                                  </div>
                                              )}

                                              {data.items.map((item, index) => {
                                                  const subtotal = (Number(item.quantity) || 0) * (Number(item.sold_price) || 0);
                                                  const offeredPrice = offeredPriceMap[item.product_id] ?? 0;

                                                  return (
                                                      <div
                                                          key={`record-item-${index}`}
                                                          className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
                                                      >
                                                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                                              <div className="lg:col-span-5">
                                                                  <SelectInput
                                                                      name={`product_${index}`}
                                                                      label="Produk"
                                                                      placeholder="Pilih produk"
                                                                      options={productOptions}
                                                                      value={item.product_id}
                                                                      onChange={(_, value) => handleRecordProductChange(index, value)}
                                                                      error={recordError(index, "product_id")}
                                                                      required={true}
                                                                  />
                                                              </div>
                                                              <div className="lg:col-span-2">
                                                                  <label className="mb-1 block">
                                                                      Qty<span className="text-sm text-red-500 font-bold"> *</span>
                                                                  </label>
                                                                  <NumberInput
                                                                      name={`quantity_${index}`}
                                                                      qty={index}
                                                                      value={item.quantity}
                                                                      min={1}
                                                                      onChange={handleRecordQtyChange}
                                                                  />
                                                                  {recordError(index, "quantity") && (
                                                                      <p className="text-red-400 font-bold mt-1">{recordError(index, "quantity")}</p>
                                                                  )}
                                                              </div>
                                                              <div className="lg:col-span-2">
                                                                  <div className="mb-1 flex items-center justify-between gap-3">
                                                                      <label className="block">
                                                                          Harga Jual<span className="text-sm text-red-500 font-bold"> *</span>
                                                                      </label>
                                                                  </div>
                                                                  <NumberInput
                                                                      name={`sold_price_${index}`}
                                                                      qty={index}
                                                                      value={item.sold_price}
                                                                      min={0}
                                                                      onChange={handleRecordPriceChange}
                                                                  />
                                                                  {recordError(index, "sold_price") && (
                                                                      <p className="text-red-400 font-bold mt-1">{recordError(index, "sold_price")}</p>
                                                                  )}
                                                              </div>
                                                              <div className="lg:col-span-2">
                                                                  <label className="mb-1 block">Subtotal</label>
                                                                  <div className="px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                                      Rp{subtotal.toLocaleString("id-ID")}
                                                                  </div>
                                                              </div>
                                                              <div className="lg:col-span-1">
                                                                  <button
                                                                      type="button"
                                                                      onClick={() => removeRecordItem(index)}
                                                                      className="w-full h-[45px] flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                                  >
                                                                      <TbTrash className="text-2xl" />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  );
                                              })}
                                          </div>

                                          <div className="mt-4 flex justify-end">
                                              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 min-w-72">
                                                  <div className="flex justify-between items-center text-lg font-bold">
                                                      <span>Total Laporan</span>
                                                      <span>Rp{recordTotal.toLocaleString("id-ID")}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="flex justify-end">
                                          <button
                                              type="submit"
                                              disabled={processing}
                                              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                          >
                                              {processing ? "Sending..." : "Kirim Laporan"}
                                          </button>
                                      </div>
                                  </form>
                              </div>
                          </motion.div>
                      </motion.div>
                  )}
              </AnimatePresence>,
              modalRoot
          )
        : null;

    return (
        <>
            {recordModal}
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
                        gridLayout="1.5fr 1fr 1fr 1fr"
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
                                key: "customer",
                                label: "Customer",
                                render: (record) =>
                                    record.customer?.name ?? (
                                        <span className="italic text-slate-400 dark:text-slate-500">Walk-in</span>
                                    ),
                            },
                            {
                                key: "sales",
                                label: "Sales",
                                render: (record) => record.sale?.user?.name ?? "-",
                            },
                            {
                                key: "total",
                                label: "Total",
                                render: (record) =>
                                    `Rp${(record.items ?? [])
                                        .reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0)
                                        .toLocaleString("id-ID")}`,
                            },
                            {
                                key: "status",
                                label: "Status",
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
