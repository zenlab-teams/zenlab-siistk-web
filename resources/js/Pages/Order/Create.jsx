import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbPlus, TbTrash } from "react-icons/tb";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";
import CheckboxInput from "../../Components/input/CheckboxInput";
import NumberInput from "../../Components/input/NumberInput";
import SelectInput from "../../Components/input/SelectInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import TextInput from "../../Components/input/TextInput";

const createEmptyItem = () => ({
    product_id: null,
    quantity: 1,
});

const OrderCreate = ({ flash, customers, products }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "order", subRoute: null }));
    }, [dispatch]);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: null,
        items: [],
        due_date: "",
        notes: "",
        pay_now: false,
        payment_type: "full",
        payment_amount: 0,
    });

    const customerOptions = useMemo(
        () => [
            { value: null, label: "Walk-in" },
            ...customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
            })),
        ],
        [customers]
    );

    const productOptions = useMemo(
        () =>
            products.map((product) => ({
                value: product.id,
                label: product.name,
                stock: product.stocks_sum_quantity ?? 0,
            })),
        [products]
    );

    const productPrices = useMemo(() => {
        const prices = new Map();
        products.forEach((product) => {
            prices.set(product.id, product.price);
        });

        return prices;
    }, [products]);

    const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter((productId) => productId !== null);

    const getProductOptionsByRow = (index) => {
        const currentProductId = data.items[index]?.product_id ?? null;

        return productOptions.filter((option) => option.value === currentProductId || !selectedProductIds.includes(option.value));
    };

    const getProductPrice = (productId) => productPrices.get(productId) ?? 0;

    const totalAmount = data.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0) * getProductPrice(item.product_id);
    }, 0);

    const paymentTypeOptions = [
        { value: "dp", label: "DP" },
        { value: "installment", label: "Installment" },
        { value: "full", label: "Full" },
    ];

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

    const handleItemProductChange = (index, productId) => {
        const normalizedProductId = productId ? Number(productId) : null;
        updateItem(index, {
            product_id: normalizedProductId,
            quantity: 1, // Reset quantity when product changes
        });
    };

    const handleItemQuantityChange = (index, value) => {
        const item = data.items[index];
        const product = products.find((p) => p.id === item.product_id);
        const stock = product?.stocks_sum_quantity ?? 0;
        
        updateItem(index, {
            quantity: Math.max(1, Math.min(stock > 0 ? stock : 1, Number(value) || 1)),
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("order.store"));
    };

    const handleReset = () => {
        setData({
            customer_id: null,
            items: [],
            due_date: "",
            notes: "",
            pay_now: false,
            payment_type: "full",
            payment_amount: 0,
        });
    };

    const itemError = (index, field) => errors[`items.${index}.${field}`];

    return (
        <Layout flash={flash}>
            <Head>
                <title>Create Order | TelatenKarya</title>
            </Head>
            <Sidebar />

            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Create new cashier order</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xl font-bold">Create Order</p>
                        <Link
                            href={route("order.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput
                                name="customer_id"
                                label="Customer"
                                placeholder="Select Customer (optional)"
                                options={customerOptions}
                                value={data.customer_id}
                                onChange={setData}
                                error={errors.customer_id}
                            />
                            <TextInput
                                name="due_date"
                                type="date"
                                label="Due Date"
                                value={data.due_date}
                                onChange={setData}
                                error={errors.due_date}
                            />
                        </div>

                        <TextAreaInput
                            name="notes"
                            label="Notes"
                            placeholder="Add notes (optional)"
                            value={data.notes}
                            onChange={setData}
                            error={errors.notes}
                        />

                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <p className="text-lg font-bold">Order Items</p>
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
                                        No item added yet. Click <span className="font-bold">Add Item</span> to start.
                                    </div>
                                )}

                                {data.items.map((item, index) => {
                                    const unitPrice = getProductPrice(item.product_id);
                                    const subtotal = (Number(item.quantity) || 0) * unitPrice;

                                    return (
                                        <div
                                            key={`order-item-${index}`}
                                            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                                <div className="lg:col-span-5">
                                                    <SelectInput
                                                        name={`product_${index}`}
                                                        label="Product"
                                                        placeholder="Select product"
                                                        options={getProductOptionsByRow(index)}
                                                        value={item.product_id}
                                                        onChange={(_, value) => handleItemProductChange(index, value)}
                                                        error={itemError(index, "product_id")}
                                                        required={true}
                                                        isOptionDisabled={(option) => option.stock <= 0}
                                                        formatOptionLabel={({ label, stock }) => (
                                                            <div className="flex items-center justify-between">
                                                                <span className={stock <= 0 ? "text-slate-400" : ""}>{label}</span>
                                                                <span className={`text-sm ${stock <= 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                                                                    {stock <= 0 ? "Out of Stock" : `Stock: ${stock}`}
                                                                </span>
                                                            </div>
                                                        )}
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
                                                        max={products.find(p => p.id === item.product_id)?.stocks_sum_quantity ?? null}
                                                        onChange={handleItemQuantityChange}
                                                    />
                                                    {itemError(index, "quantity") && (
                                                        <p className="text-red-400 font-bold mt-1">{itemError(index, "quantity")}</p>
                                                    )}
                                                </div>
                                                <div className="lg:col-span-2">
                                                    <label className="mb-1 block">Unit Price</label>
                                                    <div className="px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        Rp{unitPrice.toLocaleString("id-ID")}
                                                    </div>
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

                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckboxInput
                                    name="pay_now"
                                    checked={data.pay_now}
                                    onChange={(event) => setData("pay_now", event.target.checked)}
                                />
                                <label htmlFor="pay_now" className="font-bold cursor-pointer">
                                    Record payment now
                                </label>
                            </div>

                            {data.pay_now && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectInput
                                        name="payment_type"
                                        label="Payment Type"
                                        options={paymentTypeOptions}
                                        value={data.payment_type}
                                        onChange={setData}
                                        error={errors.payment_type}
                                        required={true}
                                    />
                                    <NumberInput
                                        name="payment_amount"
                                        label="Payment Amount"
                                        value={data.payment_amount}
                                        min={1}
                                        onChange={setData}
                                        error={errors.payment_amount}
                                        required={true}
                                    />
                                </div>
                            )}
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
                                {processing ? "Saving..." : "Create Order"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </Layout>
    );
};

export default OrderCreate;
