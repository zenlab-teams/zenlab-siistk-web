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
import SelectInput from "../../Components/input/SelectInput";

const ProductEdit = ({ flash, product }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, []);

    const initialProductForm = {
        name: product.name,
        price: product.price,
        minimum: product.minimum ?? null,
        description: product.description ?? "",
        thumbnail: "old",
        _method: "PUT",
        stock_quantity: null,
        stock_type: "in",
        stock_unit_cost: null,
        stock_note: "",
    };

    const { data, setData, post, errors } = useForm(initialProductForm);
    const stockTypeOptions = [
        { value: "in", label: "Stok Masuk" },
        { value: "out", label: "Stok Keluar" },
        { value: "adjustment", label: "Penyesuaian" },
    ];

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
                <title>Edit Produk | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Produk</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Edit Produk Saat Ini</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Edit Produk</p>
                        <Link
                            href={route("product.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Kembali
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-7xl flex flex-col gap-3">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                                <ImageInput
                                    name="thumbnail"
                                    label="Gambar"
                                    placeholder="Unggah Gambar Produk"
                                    edit={product.thumbnail ? "/storage/" + product.thumbnail : null}
                                    value={data.thumbnail}
                                    onChange={setData}
                                    error={errors.thumbnail && errors.thumbnail}
                                />
                                <div className="w-full flex flex-col gap-3">
                                    <TextInput
                                        type="text"
                                        name="name"
                                        label="Nama Produk"
                                        placeholder="Masukkan Nama Produk"
                                        required={true}
                                        onChange={setData}
                                        value={data.name}
                                        error={errors.name && errors.name}
                                    />
                                    <NumberInput
                                        type="currency"
                                        name="price"
                                        label="Harga"
                                        placeholder="Masukkan Harga Produk (Rp)"
                                        value={data.price}
                                        onChange={setData}
                                        required={true}
                                        error={errors.price && errors.price}
                                    />
                                    <NumberInput
                                        name="minimum"
                                        label="Stok Minimum"
                                        placeholder="Masukkan Stok Minimum"
                                        value={data.minimum}
                                        onChange={setData}
                                        min={0}
                                        error={errors.minimum && errors.minimum}
                                    />
                                    <TextAreaInput
                                        name="description"
                                        label="Deskripsi"
                                        placeholder="Masukkan Deskripsi Produk"
                                        onChange={setData}
                                        value={data.description}
                                        error={errors.description && errors.description}
                                    />
                                    <div className="border-t-2 dark:border-slate-700 pt-4 mt-2">
                                        <p className="font-bold text-lg mb-3">
                                            Tambah Stok{" "}
                                            <span className="text-slate-400 text-sm font-normal">(opsional)</span>
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <SelectInput
                                                name="stock_type"
                                                label="Tipe"
                                                placeholder="Pilih Tipe Stok"
                                                options={stockTypeOptions}
                                                value={data.stock_type}
                                                onChange={setData}
                                                error={errors.stock_type && errors.stock_type}
                                            />
                                            <NumberInput
                                                name="stock_quantity"
                                                label="Jumlah"
                                                placeholder="Masukkan Jumlah"
                                                value={data.stock_quantity}
                                                onChange={setData}
                                                error={errors.stock_quantity && errors.stock_quantity}
                                            />
                                            <NumberInput
                                                name="stock_unit_cost"
                                                type="currency"
                                                label="Harga Satuan"
                                                placeholder="Masukkan Harga Satuan (Rp)"
                                                value={data.stock_unit_cost}
                                                onChange={(_, value) => setData("stock_unit_cost", value)}
                                                error={errors.stock_unit_cost && errors.stock_unit_cost}
                                            />
                                            <TextInput
                                                name="stock_note"
                                                label="Catatan"
                                                placeholder="Masukkan Catatan"
                                                onChange={setData}
                                                value={data.stock_note}
                                                error={errors.stock_note && errors.stock_note}
                                            />
                                        </div>
                                    </div>
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
                                    Edit Produk
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
