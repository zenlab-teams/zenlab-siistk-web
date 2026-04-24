import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { TbPlus } from "react-icons/tb";
import { MdKeyboardArrowLeft } from "react-icons/md";
import TextInput from "../../Components/input/TextInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import SelectInput from "../../Components/input/SelectInput";
import NumberInput from "../../Components/input/NumberInput";
import ImageInput from "../../Components/input/ImageInput";

const ProductCreate = ({ flash, suppliers, categories }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        price: null,
        stock: null,
        supplier_id: null,
        product_category_id: null,
        description: "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("product.store"));
    };

    const handleReset = () => {
        setData({ name: "", price: null, stock: null, supplier_id: null, product_category_id: null, description: "", image: null });
    };

    let supplierOptions = [];
    suppliers.forEach((supplier) => {
        supplierOptions.push({ value: supplier.id, label: supplier.name });
    });

    let categoriesOptions = [{ value: null, label: "None", color: "grey" }];
    categories.forEach((category) => {
        categoriesOptions.push({ value: category.id, label: category.name, color: category.color });
    });

    const categoriesFormatSelect = ({ label, value, color }) => (
        <div className="w-full flex items-center justify-center">
            <div
                className={`w-fit px-3 font-bold rounded-lg ${
                    color == "Red"
                        ? "!bg-red-200 text-red-500 dark:!bg-opacity-20 dark:!bg-red-500"
                        : color == "Green"
                        ? "!bg-green-200 text-green-500 dark:!bg-opacity-20 dark:!bg-green-500"
                        : color == "Blue"
                        ? "!bg-blue-200 text-blue-500 dark:!bg-opacity-20 dark:!bg-blue-500"
                        : color == "Yellow"
                        ? "!bg-yellow-200 text-yellow-500 dark:!bg-opacity-20 dark:!bg-yellow-500"
                        : color == "Purple"
                        ? "!bg-purple-200 text-purple-500 dark:!bg-opacity-20 dark:!bg-purple-500"
                        : color == "Cyan"
                        ? "!bg-cyan-200 text-cyan-500 dark:!bg-opacity-20 dark:!bg-cyan-500"
                        : color == "grey"
                        ? "!bg-slate-200 text-slate-500 dark:!bg-opacity-20 dark:!bg-slate-500"
                        : null
                }`}
            >
                {label}
            </div>
        </div>
    );

    console.log(data);

    return (
        <Layout flash={flash}>
            <Head>
                <title>Create Sales | AgentApp</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Sales</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Add New Sales</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Create Sales</p>
                        <Link
                            href={route("product.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-7xl flex flex-col gap-3" encType="multipart/form-data">
                            <div className="flex flex-col md:flex-row justify-center gap-5">
                                <div className="w-full flex flex-col gap-3">
                                    <TextInput
                                        type="text"
                                        name="name"
                                        label="Property Name"
                                        placeholder="Enter Sales Name"
                                        required={true}
                                        onChange={setData}
                                        value={data.name}
                                        error={errors.name && errors.name}
                                    />
                                    <div className="flex flex-col sm:flex-row w-full gap-3">
                                        <NumberInput
                                            type="currency"
                                            name="price"
                                            label="Price"
                                            placeholder="Enter Price of Sales (Rp)"
                                            value={data.price}
                                            onChange={setData}
                                            required={true}
                                            error={errors.price && errors.price}
                                        />
                                        <NumberInput
                                            type="number"
                                            name="stock"
                                            placeholder="Enter Number of Sales Stock"
                                            label="Stock"
                                            arrow={false}
                                            value={data.stock}
                                            onChange={setData}
                                            required={true}
                                            error={errors.stock && errors.stock}
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row w-full gap-3">
                                        <SelectInput
                                            name="supplier_id"
                                            label="Agent"
                                            placeholder="Select Agent"
                                            options={supplierOptions}
                                            value={data.supplier_id}
                                            onChange={setData}
                                            error={errors.supplier_id && errors.supplier_id}
                                            required={true}
                                        />
                                        <SelectInput
                                            name="product_category_id"
                                            label="Customer"
                                            placeholder="Select Customer"
                                            options={categoriesOptions}
                                            formatOptionLabel={categoriesFormatSelect}
                                            value={data.product_category_id}
                                            onChange={setData}
                                            error={errors.product_category_id && errors.product_category_id}
                                        />
                                    </div>
                                    <TextAreaInput
                                        name="description"
                                        label="Description"
                                        placeholder="Enter Customer Description"
                                        onChange={setData}
                                        required={true}
                                        value={data.description}
                                        error={errors.description && errors.description}
                                    />
                                </div>
                                <div className="w-full">
                                    <ImageInput
                                        name="image"
                                        label="Photo"
                                        placeholder="Add photo of product"
                                        required={true}
                                        onChange={setData}
                                        value={data.image}
                                        error={errors.image && errors.image}
                                    />
                                </div>
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
                                    Add Sales
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ProductCreate;
