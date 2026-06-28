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

const CustomerEdit = ({ flash, supplier }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "supplier", subRoute: null }));
    }, []);

    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier.name,
        email: supplier.email,
        number_phone: supplier.number_phone,
        address: supplier.address,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("supplier.update", supplier.id));
    };

    const handleReset = () => {
        setData({ name: supplier.name, email: supplier.email, number_phone: supplier.number_phone, address: supplier.address });
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Edit Pemasok | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Pemasok</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Edit Pemasok Saat Ini</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Edit Pemasok</p>
                        <Link
                            href={route("supplier.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Kembali
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-3">
                            <TextInput
                                type="text"
                                name="name"
                                label="Nama"
                                placeholder="Masukkan Nama Pemasok"
                                required={true}
                                onChange={setData}
                                value={data.name}
                                error={errors.name && errors.name}
                            />
                            <div className="flex w-full gap-3">
                                <TextInput
                                    type="email"
                                    name="email"
                                    label="Email"
                                    placeholder="Masukkan Email Pemasok"
                                    required={true}
                                    onChange={setData}
                                    value={data.email}
                                    error={errors.email && errors.email}
                                />
                                <NumberInput
                                    name="number_phone"
                                    label="Nomor Telepon"
                                    type="phone"
                                    placeholder="Masukkan Nomor Telepon"
                                    required={true}
                                    onChange={setData}
                                    value={data.number_phone}
                                    error={errors.number_phone && errors.number_phone}
                                />
                            </div>
                            <TextAreaInput
                                name="address"
                                label="Alamat"
                                placeholder="Masukkan Alamat Pemasok"
                                required={true}
                                onChange={setData}
                                value={data.address}
                                error={errors.address && errors.address}
                            />
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
                                    Edit Pemasok
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CustomerEdit;
