import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbPlus, TbTrash } from "react-icons/tb";
import NumberInput from "../../Components/input/NumberInput";
import SelectInput from "../../Components/input/SelectInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import TextInput from "../../Components/input/TextInput";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";

const createEmptyItem = () => ({
    product_id: null,
    quantity: 1,
    offered_price: 0,
});

const createEmptySales = () => ({
    sale_id: null,
});

const OfferCreate = ({ flash, sales, products }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "offer", subRoute: null }));
    }, [dispatch]);

    const { data, setData, post, transform, processing, errors } = useForm({
        name: "",
        description: "",
        date: "",
        sales: [],
        items: [],
    });

    const productOptions = useMemo(
        () =>
            products.map((product) => ({
                value: product.id,
                label: `${product.name} (Normal: Rp${Number(product.price ?? 0).toLocaleString("id-ID")})`,
            })),
        [products]
    );

    const salesOptions = useMemo(
        () =>
            sales.map((sale) => ({
                value: sale.id,
                label: sale.user?.name ?? "-",
            })),
        [sales]
    );

    const getAvailableSalesOptions = (currentIndex) => {
        const selectedIds = data.sales
            .map((s, idx) => (idx !== currentIndex ? s.sale_id : null))
            .filter(Boolean);

        return salesOptions.filter((option) => !selectedIds.includes(option.value));
    };

    const updateItem = (index, patch) => {
        const nextItems = [...data.items];
        nextItems[index] = { ...nextItems[index], ...patch };
        setData("items", nextItems);
    };

    const addItem = () => {
        setData("items", [...data.items, createEmptyItem()]);
    };

    const removeItem = (index) => {
        const nextItems = data.items.filter((_, itemIndex) => itemIndex !== index);
        setData("items", nextItems);
    };

    const addSales = () => {
        setData("sales", [...data.sales, createEmptySales()]);
    };

    const removeSales = (index) => {
        const nextSales = data.sales.filter((_, salesIndex) => salesIndex !== index);
        setData("sales", nextSales);
    };

    const updateSales = (index, saleId) => {
        const nextSales = [...data.sales];
        nextSales[index] = { ...nextSales[index], sale_id: saleId ? Number(saleId) : null };
        setData("sales", nextSales);
    };

    const handleItemProductChange = (index, productId) => {
        updateItem(index, {
            product_id: productId ? Number(productId) : null,
        });
    };

    const handleItemQuantityChange = (index, value) => {
        updateItem(index, {
            quantity: Math.max(1, Number(value) || 1),
        });
    };

    const handleItemPriceChange = (index, value) => {
        updateItem(index, {
            offered_price: Math.max(0, Number(value) || 0),
        });
    };

    const totalAmount = data.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0) * (Number(item.offered_price) || 0);
    }, 0);

    const handleSubmit = (event) => {
        event.preventDefault();

        transform(({ sales, ...rest }) => ({
            ...rest,
            sale_ids: sales.map((s) => s.sale_id).filter(Boolean),
        }));

        post(route("offer.store"));
    };

    const handleReset = () => {
        setData({
            name: "",
            description: "",
            date: "",
            sales: [],
            items: [],
        });
    };

    const itemError = (index, field) => errors[`items.${index}.${field}`];

    return (
        <Layout flash={flash}>
            <Head>
                <title>Create Offer | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Offers</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Create weekly offer for sales team</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xl font-bold">Create Offer</p>
                        <Link
                            href={route("offer.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                name="name"
                                label="Nama Penawaran"
                                placeholder="Masukkan nama penawaran"
                                value={data.name}
                                onChange={setData}
                                error={errors.name}
                                required={true}
                            />
                            <TextInput
                                name="date"
                                type="date"
                                label="Tanggal Penawaran"
                                value={data.date}
                                onChange={setData}
                                error={errors.date}
                                required={true}
                            />
                        </div>

                        <TextAreaInput
                            name="description"
                            label="Deskripsi"
                            placeholder="Deskripsi penawaran (opsional)"
                            value={data.description}
                            onChange={setData}
                            error={errors.description}
                        />

                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <p className="text-lg font-bold">
                                    Sales Reps<span className="text-sm text-red-500 font-bold"> *</span>
                                </p>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={addSales}
                                    disabled={salesOptions.length === data.sales.length}
                                >
                                    <TbPlus className="text-xl" /> Add Sales Rep
                                </button>
                            </div>

                            {errors.sale_ids && <p className="text-red-400 font-bold mb-3">{errors.sale_ids}</p>}

                            <div className="flex flex-col gap-3">
                                {data.sales.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                                        Belum ada sales rep. Klik <span className="font-bold">Add Sales Rep</span> untuk mulai.
                                    </div>
                                )}

                                {data.sales.map((sale, index) => {
                                    const salesError = errors[`sale_ids.${index}`];

                                    return (
                                        <div
                                            key={`sales-${index}`}
                                            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                                <div className="lg:col-span-11">
                                                    <SelectInput
                                                        name={`sales_${index}`}
                                                        label="Sales Representative"
                                                        placeholder="Pilih sales rep"
                                                        options={getAvailableSalesOptions(index)}
                                                        value={sale.sale_id}
                                                        onChange={(_, value) => updateSales(index, value)}
                                                        error={salesError}
                                                        required={true}
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <button
                                                        type="button"
                                                        className="w-full h-[45px] flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                        onClick={() => removeSales(index)}
                                                        aria-label="Remove sales rep"
                                                    >
                                                        <TbTrash className="text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <p className="text-lg font-bold">Offer Items</p>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold transition-all"
                                    onClick={addItem}
                                >
                                    <TbPlus className="text-xl" /> Add Item
                                </button>
                            </div>

                            {errors.items && (
                                <p className="text-red-400 font-bold mb-3">{errors.items}</p>
                            )}

                            <div className="flex flex-col gap-3">
                                {data.items.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                                        Belum ada item. Klik <span className="font-bold">Add Item</span> untuk mulai.
                                    </div>
                                )}

                                {data.items.map((item, index) => {
                                    const subtotal = (Number(item.quantity) || 0) * (Number(item.offered_price) || 0);

                                    return (
                                        <div
                                            key={`offer-item-${index}`}
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
                                                        onChange={(_, value) => handleItemProductChange(index, value)}
                                                        error={itemError(index, "product_id")}
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
                                                        onChange={handleItemQuantityChange}
                                                    />
                                                    {itemError(index, "quantity") && (
                                                        <p className="text-red-400 font-bold mt-1">{itemError(index, "quantity")}</p>
                                                    )}
                                                </div>
                                                <div className="lg:col-span-2">
                                                    <label className="mb-1 block">
                                                        Harga Tawar<span className="text-sm text-red-500 font-bold"> *</span>
                                                    </label>
                                                    <NumberInput
                                                        name={`offered_price_${index}`}
                                                        qty={index}
                                                        value={item.offered_price}
                                                        min={0}
                                                        onChange={handleItemPriceChange}
                                                    />
                                                    {itemError(index, "offered_price") && (
                                                        <p className="text-red-400 font-bold mt-1">{itemError(index, "offered_price")}</p>
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
                                                        className="w-full h-[45px] flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                        onClick={() => removeItem(index)}
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
                                        <span>Total</span>
                                        <span>Rp{totalAmount.toLocaleString("id-ID")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                            >
                                {processing ? "Saving..." : "Buat Offer"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </Layout>
    );
};

export default OfferCreate;
