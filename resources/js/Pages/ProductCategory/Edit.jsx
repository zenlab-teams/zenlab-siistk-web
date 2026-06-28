import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { TbPlus } from "react-icons/tb";
import { MdKeyboardArrowLeft } from "react-icons/md";
import TextInput from "../../Components/input/TextInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import SelectInput from "../../Components/input/SelectInput";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useRowSelect } from "@table-library/react-table-library/select";
import { tableStyle } from "../../config/tableConfig";
import { useSort, HeaderCellSort, SortToggleType } from "@table-library/react-table-library/sort";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import NoData from "./../../../assets/image/NoData.svg";
import CheckboxInput from "../../Components/input/CheckboxInput";
import { AnimatePresence, motion } from "framer-motion";

const ProductCategoryEdit = ({ flash, products, category, selectedProducts }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "category" }));
    }, []);

    const [productData, setProductData] = useState(products);

    const tableData = { nodes: productData };

    const onSelectChange = (action, state) => {
        setData("selectedProducts", state.ids);
    };

    const select = useRowSelect(tableData, {
        onChange: onSelectChange,
    });

    const { data, setData, post, put, processing, errors } = useForm({
        name: category.name,
        description: category.description,
        color: category.color,
        selectedProducts: selectedProducts,
    });

    useEffect(() => {
        if (data.selectedProducts.length > 0) {
            select.fns.onAddByIds(data.selectedProducts);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("category.update", category.id));
    };

    const tableTheme = tableStyle("auto 1.5fr 1fr 1fr");

    const sort = useSort(
        tableData,
        {},
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortIcon: {
                margin: "8px",
                iconDefault: <FaSort fontSize="small" />,
                iconUp: <FaSortUp fontSize="small" />,
                iconDown: <FaSortDown fontSize="small" />,
            },
            sortFns: {
                NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
                PRICE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
                STOCK: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
            },
        }
    );

    const handleReset = () => {
        setData({ name: category.name, description: category.description, color: category.color, selectedProducts: selectedProducts });
        select.fns.onRemoveAll();
        select.fns.onAddByIds(selectedProducts);
    };

    const categoryColorOptions = [
        { value: "Red", label: "Merah" },
        { value: "Green", label: "Hijau" },
        { value: "Blue", label: "Biru" },
        { value: "Yellow", label: "Kuning" },
        { value: "Purple", label: "Ungu" },
        { value: "Cyan", label: "Sian" },
    ];

    const categoryColorFormatSelect = ({ label, value }) => (
        <div
            className={`flex items-center ${
                value == "Red"
                    ? "text-red-500"
                    : value == "Green"
                    ? "text-green-500"
                    : value == "Blue"
                    ? "text-blue-500"
                    : value == "Yellow"
                    ? "text-yellow-500"
                    : value == "Purple"
                    ? "text-purple-500"
                    : value == "Cyan"
                    ? "text-cyan-500"
                    : null
            }`}
        >
            <div
                className={`mr-3 h-5 w-5 rounded-full ${
                    value == "Red"
                        ? "bg-red-500"
                        : value == "Green"
                        ? "bg-green-500"
                        : value == "Blue"
                        ? "bg-blue-500"
                        : value == "Yellow"
                        ? "bg-yellow-500"
                        : value == "Purple"
                        ? "bg-purple-500"
                        : value == "Cyan"
                        ? "bg-cyan-500"
                        : null
                } `}
            ></div>
            <p className="font-bold">{label}</p>
        </div>
    );

    return (
        <Layout flash={flash}>
            <Head>
                <title>Edit Kategori Produk | TelatenKarya</title>
            </Head>
            <Sidebar />
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Kategori Produk</h1>
                    <p className="text-slate-500 text-lg">Edit Kategori Produk Saat Ini</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Edit Kategori Produk</p>
                        <Link
                            href={route("category.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Kembali
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                            <div className="flex justify-center gap-5">
                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex w-full gap-3">
                                        <TextInput
                                            type="text"
                                            name="name"
                                            label="Nama"
                                            placeholder="Masukkan Nama Kategori"
                                            required={true}
                                            onChange={setData}
                                            value={data.name}
                                            error={errors.name && errors.name}
                                        />
                                        <SelectInput
                                            name="color"
                                            label="Warna"
                                            placeholder="Pilih Warna Kategori"
                                            options={categoryColorOptions}
                                            formatOptionLabel={categoryColorFormatSelect}
                                            value={data.color}
                                            onChange={setData}
                                            error={errors.color && errors.color}
                                            required={true}
                                        />
                                    </div>
                                    <TextAreaInput
                                        name="description"
                                        label="Deskripsi"
                                        placeholder="Masukkan Deskripsi Kategori"
                                        required={true}
                                        onChange={setData}
                                        value={data.description}
                                        error={errors.description && errors.description}
                                    />
                                </div>
                                <div className="w-full">
                                    <p>Produk</p>
                                    <div className="max-h-96 relative">
                                        <Table
                                            data={tableData}
                                            className="text-lg mt-3 !table-fixed max-h-96 !border-b-2 dark:border-slate-600"
                                            theme={tableTheme}
                                            sort={sort}
                                            layout={{ fixedHeader: true, custom: true }}
                                            select={select}
                                        >
                                            {(tableList) => (
                                                <>
                                                    <Header>
                                                        <HeaderRow
                                                            className="!bg-slate-100 dark:!bg-slate-700 text-slate-500 dark:text-slate-400"
                                                            layout={{ custom: true }}
                                                        >
                                                            <HeaderCell className="border-s-2 border-y-2 rounded-s-xl !py-2 !px-3 dark:border-slate-600">
                                                                <CheckboxInput
                                                                    name="tableSelect"
                                                                    checked={select.state.all}
                                                                    indeterminate={!select.state.all && !select.state.none}
                                                                    onChange={select.fns.onToggleAll}
                                                                />
                                                            </HeaderCell>
                                                            <HeaderCellSort
                                                                className="!py-2 !px-3 border-y-2 border-slate-200 dark:border-slate-600 hover:text-sky-500 transition-all"
                                                                sortKey="NAME"
                                                            >
                                                                Nama Produk
                                                            </HeaderCellSort>
                                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Kategori</HeaderCell>
                                                            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                                Pemasok
                                                            </HeaderCell>
                                                        </HeaderRow>
                                                    </Header>
                                                    <Body>
                                                        {tableList.length > 0 ? (
                                                            tableList.map((item) => (
                                                                <Row
                                                                    key={item.id}
                                                                    item={item}
                                                                    className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all"
                                                                >
                                                                    <Cell className="!p-3 rounded-s-xl">
                                                                        <CheckboxInput
                                                                            name={"tableItemSelect" + item.id}
                                                                            checked={select.state.ids.includes(item.id)}
                                                                            onChange={() => select.fns.onToggleById(item.id)}
                                                                        />
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                            className="flex justify-start gap-3 items-center whitespace-normal"
                                                                        >
                                                                            <img
                                                                                src={"/storage/productImages/" + item.image}
                                                                                className="w-20 h-20 object-cover rounded-xl"
                                                                            />
                                                                            {item.name}
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        {item.product_category_id ? (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: 0.05 }}
                                                                                className={`w-fit px-3 font-bold rounded-lg ${
                                                                                    item.product_category.color == "Red"
                                                                                        ? "bg-red-200 text-red-500 dark:bg-opacity-20 dark:bg-red-500"
                                                                                        : item.product_category.color == "Green"
                                                                                        ? "bg-green-200 text-green-500 dark:bg-opacity-20 dark:bg-green-500"
                                                                                        : item.product_category.color == "Blue"
                                                                                        ? "bg-blue-200 text-blue-500 dark:bg-opacity-20 dark:bg-blue-500"
                                                                                        : item.product_category.color == "Yellow"
                                                                                        ? "bg-yellow-200 text-yellow-500 dark:bg-opacity-20 dark:bg-yellow-500"
                                                                                        : item.product_category.color == "Purple"
                                                                                        ? "bg-purple-200 text-purple-500 dark:bg-opacity-20 dark:bg-purple-500"
                                                                                        : item.product_category.color == "Cyan"
                                                                                        ? "bg-cyan-200 text-cyan-500 dark:bg-opacity-20 dark:bg-cyan-500"
                                                                                        : null
                                                                                }`}
                                                                            >
                                                                                {item.product_category.name}
                                                                            </motion.div>
                                                                        ) : (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: 0.05 }}
                                                                                className="w-fit px-3 font-bold rounded-lg bg-slate-200 text-slate-500 dark:bg-opacity-20 dark:bg-slate-400 dark:text-slate-400"
                                                                            >
                                                                                <span className="text-lg">Tidak Ada</span>
                                                                            </motion.div>
                                                                        )}
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                        >
                                                                            <span className="text-lg">{item.supplier.name}</span>
                                                                        </motion.div>
                                                                    </Cell>
                                                                </Row>
                                                            ))
                                                        ) : (
                                                            <Cell
                                                                gridColumnStart={1}
                                                                gridColumnEnd={100}
                                                                className="h-[25rem] *:!h-full *:flex *:items-center *:justify-center *:flex-col"
                                                            >
                                                                <img src={NoData} className="w-52" />
                                                                <p className="text-2xl py-2 px-5 bg-slate-200 text-slate-400 font-bold rounded-xl mt-8 dark:text-slate-500 dark:bg-slate-700">
                                                                    Data Tidak Ditemukan
                                                                </p>
                                                                <p className="text-slate-400 dark:text-slate-500 mt-3">Tidak dapat menemukan data apapun</p>
                                                            </Cell>
                                                        )}
                                                    </Body>
                                                </>
                                            )}
                                        </Table>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-end mt-3">
                                <button
                                    type="reset"
                                    onClick={handleReset}
                                    className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold"
                                >
                                    Edit Kategori
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ProductCategoryEdit;
