import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Layout from "../../../Layouts/Default";
import Sidebar from "../../../Layouts/Sidebar";
import { setCurrentRoute } from "../../../Redux/slice";
import SelectInput from "../../../Components/input/SelectInput";
import NumberInput from "../../../Components/input/NumberInput";
import TextInput from "../../../Components/input/TextInput";

const ProductStockCreate = ({ flash, product }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "stock" }));
    }, [dispatch]);

    const stockTypeOptions = [
        { value: "in", label: "Stock In" },
        { value: "out", label: "Stock Out" },
        { value: "adjustment", label: "Adjustment" },
    ];

    const initialForm = {
        type: "in",
        quantity: null,
        unit_cost: null,
        note: "",
    };

    const { data, setData, post, errors } = useForm(initialForm);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("product.stock.store", product.id));
    };

    const handleReset = () => {
        setData(initialForm);
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Add Stock | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Add Stock - {product.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Create a new stock entry for this product</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Add Stock Entry</p>
                        <Link
                            href={route("product.show", product.id)}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SelectInput
                                    name="type"
                                    label="Type"
                                    placeholder="Select Stock Type"
                                    options={stockTypeOptions}
                                    value={data.type}
                                    onChange={setData}
                                    required={true}
                                    error={errors.type && errors.type}
                                />
                                <NumberInput
                                    name="quantity"
                                    label="Quantity"
                                    placeholder="Enter Quantity"
                                    value={data.quantity}
                                    onChange={setData}
                                    required={true}
                                    error={errors.quantity && errors.quantity}
                                />
                                <NumberInput
                                    name="unit_cost"
                                    type="currency"
                                    label="Unit Cost"
                                    placeholder="Enter Unit Cost (Rp)"
                                    value={data.unit_cost}
                                    onChange={(_, value) => setData("unit_cost", value)}
                                    error={errors.unit_cost && errors.unit_cost}
                                />
                                <TextInput
                                    name="note"
                                    label="Note"
                                    placeholder="Enter Note"
                                    onChange={setData}
                                    value={data.note}
                                    error={errors.note && errors.note}
                                />
                            </div>
                            <div className="flex items-center gap-3 justify-end mt-3">
                                <button
                                    type="reset"
                                    onClick={handleReset}
                                    className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    Add Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ProductStockCreate;
