import { useDispatch } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { MdKeyboardArrowLeft } from "react-icons/md";
import TextInput from "../../Components/input/TextInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import NumberInput from "../../Components/input/NumberInput";
import ImageInput from "../../Components/input/ImageInput";

const ProductEdit = ({ flash, product }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, []);

    const initialProductForm = {
        name: product.name,
        price: product.price,
        description: product.description ?? "",
        thumbnail: "old",
        _method: "PUT",
    };

    const { data, setData, post, errors } = useForm(initialProductForm);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("product.update", product.id));
    };

    const handleReset = () => {
        setData(initialProductForm);
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Edit Product | AgentApp</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Product</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Edit Current Product</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Edit Product</p>
                        <Link
                            href={route("product.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-7xl flex flex-col gap-3">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                                <ImageInput
                                    name="thumbnail"
                                    label="Thumbnail"
                                    placeholder="Upload Product Thumbnail"
                                    edit={product.thumbnail ? "/storage/" + product.thumbnail : null}
                                    value={data.thumbnail}
                                    onChange={setData}
                                    error={errors.thumbnail && errors.thumbnail}
                                />
                                <div className="w-full flex flex-col gap-3">
                                    <TextInput
                                        type="text"
                                        name="name"
                                        label="Product Name"
                                        placeholder="Enter Product Name"
                                        required={true}
                                        onChange={setData}
                                        value={data.name}
                                        error={errors.name && errors.name}
                                    />
                                    <NumberInput
                                        type="currency"
                                        name="price"
                                        label="Price"
                                        placeholder="Enter Product Price (Rp)"
                                        value={data.price}
                                        onChange={setData}
                                        required={true}
                                        error={errors.price && errors.price}
                                    />
                                    <TextAreaInput
                                        name="description"
                                        label="Description"
                                        placeholder="Enter Product Description"
                                        onChange={setData}
                                        value={data.description}
                                        error={errors.description && errors.description}
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
                                    Edit Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ProductEdit;
