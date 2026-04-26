import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Layout from "../../Layouts/Default";
import Sidebar from "../../Layouts/Sidebar";
import { setCurrentRoute } from "../../Redux/slice";
import TextInput from "../../Components/input/TextInput";
import PasswordInput from "../../Components/input/PasswordInput";
import SelectInput from "../../Components/input/SelectInput";

const UserCreate = ({ flash }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "user", subRoute: null }));
    }, [dispatch]);

    const initialForm = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "customer",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
    };

    const { data, setData, post, errors } = useForm(initialForm);

    const roleOptions = [
        { value: "admin", label: "Admin" },
        { value: "sales", label: "Sales" },
        { value: "customer", label: "Customer" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("user.store"));
    };

    const handleReset = () => {
        setData(initialForm);
    };

    return (
        <Layout flash={flash}>
            <Head>
                <title>Create User | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Add new user account</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Create User</p>
                        <Link
                            href={route("user.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TextInput
                                    type="text"
                                    name="name"
                                    label="Name"
                                    placeholder="Enter Name"
                                    required={true}
                                    onChange={setData}
                                    value={data.name}
                                    error={errors.name && errors.name}
                                />
                                <TextInput
                                    type="email"
                                    name="email"
                                    label="Email"
                                    placeholder="Enter Email"
                                    required={true}
                                    onChange={setData}
                                    value={data.email}
                                    error={errors.email && errors.email}
                                />
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    placeholder="Enter Password"
                                    required={true}
                                    onChange={setData}
                                    value={data.password}
                                    error={errors.password && errors.password}
                                />
                                <PasswordInput
                                    name="password_confirmation"
                                    label="Confirm Password"
                                    placeholder="Confirm Password"
                                    required={true}
                                    onChange={setData}
                                    value={data.password_confirmation}
                                    error={errors.password_confirmation && errors.password_confirmation}
                                />
                                <div className="md:col-span-2">
                                    <SelectInput
                                        name="role"
                                        label="Role"
                                        placeholder="Select User Role"
                                        options={roleOptions}
                                        value={data.role}
                                        required={true}
                                        onChange={setData}
                                        error={errors.role && errors.role}
                                    />
                                </div>
                            </div>

                            {data.role === "sales" && (
                                <div className="border-t-2 dark:border-slate-700 pt-4 mt-2">
                                    <p className="font-bold text-lg mb-3">
                                        Sales Data <span className="text-slate-400 text-sm font-normal">(optional)</span>
                                    </p>
                                    <TextInput
                                        type="text"
                                        name="phone"
                                        label="Phone"
                                        placeholder="Enter Sales Phone"
                                        onChange={setData}
                                        value={data.phone}
                                        error={errors.phone && errors.phone}
                                    />
                                </div>
                            )}

                            {data.role === "customer" && (
                                <div className="border-t-2 dark:border-slate-700 pt-4 mt-2">
                                    <p className="font-bold text-lg mb-3">
                                        Customer Data <span className="text-slate-400 text-sm font-normal">(optional)</span>
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <TextInput
                                            type="text"
                                            name="address"
                                            label="Address"
                                            placeholder="Enter Address"
                                            onChange={setData}
                                            value={data.address}
                                            error={errors.address && errors.address}
                                        />
                                        <TextInput
                                            type="text"
                                            name="city"
                                            label="City"
                                            placeholder="Enter City"
                                            onChange={setData}
                                            value={data.city}
                                            error={errors.city && errors.city}
                                        />
                                        <TextInput
                                            type="text"
                                            name="postal_code"
                                            label="Postal Code"
                                            placeholder="Enter Postal Code"
                                            onChange={setData}
                                            value={data.postal_code}
                                            error={errors.postal_code && errors.postal_code}
                                        />
                                    </div>
                                </div>
                            )}

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
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default UserCreate;
