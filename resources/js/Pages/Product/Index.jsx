import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { TbAdjustmentsHorizontal, TbDotsVertical, TbEdit, TbPlus, TbSearch, TbTrash } from "react-icons/tb";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useRowSelect } from "@table-library/react-table-library/select";
import { useTheme } from "@table-library/react-table-library/theme";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import TextInput from "../../Components/input/TextInput";
import ActionButtonTable from "../../Components/button/ActionButtonTable";
import ModalDelete from "../../Components/modal/ModalDelete";
import { tableRowsSizeOptions, tableStyle } from "../../config/tableConfig";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort, HeaderCellSort, SortToggleType } from "@table-library/react-table-library/sort";
import CheckboxInput from "../../Components/input/CheckboxInput";
import Select from "react-select";
import PaginationButton from "../../Components/button/PaginationButton";
import classNames from "classnames";
import NoData from "./../../../assets/image/NoData.svg";
import { router as Inertia } from "@inertiajs/react";
import SelectInput from "../../Components/input/SelectInput";

const Sales = ({ flash, products, filterSuppliers, filterCategories }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "product", subRoute: "master" }));
    }, []);

    const tableTheme = tableStyle("auto 1.5fr 1fr 1fr 1fr 1fr 0.5fr");

    const [productData, setProductData] = useState(products);
    const [search, setSearch] = useState("");
    const [modalDelete, setModalDelete] = useState(null);
    const [modalDeleteSelected, setModalDeleteSelected] = useState(null);
    const [selectedItem, setSelectedItem] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState({ bool: false, value: null });
    const [supplierFilter, setSupplierFilter] = useState({ bool: false, value: null });
    const [openFilter, setOpenFilter] = useState(false);

    const handleResetFilter = () => {
        setCategoryFilter({ bool: false, value: null });
        setSupplierFilter({ bool: false, value: null });
    };

    let supplierFilterOptions = [];
    filterSuppliers.forEach((supplierFilter) => {
        supplierFilterOptions.push({ value: supplierFilter.id, label: supplierFilter.name });
    });

    let categoriesFilterOptions = [{ value: null, label: "None", color: "grey" }];
    filterCategories.forEach((categoriesFilter) => {
        categoriesFilterOptions.push({ value: categoriesFilter.id, label: categoriesFilter.name, color: categoriesFilter.color });
    });

    const categoriesFormatSelect = ({ label, value, color }) => (
        <div className="w-full flex items-center justify-center">
            <div
                className={`w-fit px-3 font-bold rounded-lg`}
            >
                {label}
            </div>
        </div>
    );

    const rowsSizeOptions = tableRowsSizeOptions();

    const [rowsSize, setRowsSize] = useState(rowsSizeOptions[2].value);

    const data = {
        nodes: productData.filter((item) =>
            supplierFilter.bool && categoryFilter.bool
                ? item.name.toLowerCase().includes(search.toLowerCase()) &&
                  item.supplier_id == supplierFilter.value &&
                  item.product_category_id == categoryFilter.value
                : categoryFilter.bool
                ? item.name.toLowerCase().includes(search.toLowerCase()) && item.product_category_id == categoryFilter.value
                : supplierFilter.bool
                ? item.name.toLowerCase().includes(search.toLowerCase()) && item.supplier_id == supplierFilter.value
                : item.name.toLowerCase().includes(search.toLowerCase())
        ),
    };

    const pagination = usePagination(data, {
        state: {
            page: 0,
            size: rowsSize,
        },
    });

    const handleRowsSizeChange = (selected) => {
        setRowsSize(selected.value);
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        pagination.fns.onSetPage(0);
    };

    const onSelectChange = (action, state) => {
        setSelectedItem(state.ids);
    };

    const select = useRowSelect(data, {
        onChange: onSelectChange,
    });

    const sort = useSort(
        data,
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

    return (
        <Layout flash={flash}>
            <Head>
                <title>Sales | AgentApp</title>
            </Head>
            <Sidebar />
            <AnimatePresence>
                {modalDelete ? (
                    <ModalDelete
                        itemID={modalDelete}
                        closeModal={(id = null) => setModalDelete(id)}
                        type="product"
                        description="Are you sure to delete this product?"
                    />
                ) : (
                    modalDeleteSelected && (
                        <ModalDelete
                            itemID={modalDeleteSelected}
                            closeModal={(id = null) => setModalDeleteSelected(id)}
                            type="product_selected"
                            description={"Are you sure to delete " + selectedItem.length + " selected item products?"}
                        />
                    )
                )}
            </AnimatePresence>
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Sales</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">List of All The Sales</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <p className="text-xl font-bold">
                            Sales
                            <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 p-2 rounded-lg text-lg ml-1">
                                {productData.length}
                            </span>
                        </p>
                        <div className="flex items-center gap-3">
                            <AnimatePresence>
                                {selectedItem.length > 0 && (
                                    <motion.button
                                        className="flex items-center gap-2 bg-red-400 dark:bg-red-500 text-white dark:text-slate-800 hover:bg-red-500 dark:hover:bg-red-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                                        onClick={() => setModalDeleteSelected(selectedItem)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <TbTrash className="font-bold text-xl" />
                                        <span>{selectedItem.length}</span>Delete Selected
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            <label
                                htmlFor="search_category"
                                className={`flex items-center border-2 dark:border-slate-700 rounded-lg px-2 ${
                                    search && data.nodes.length == 0
                                        ? "!border-red-200 dark:!border-red-500 dark:!border-opacity-20"
                                        : search && "border-sky-300 dark:!border-sky-500 dark:!border-opacity-20"
                                } transition-all`}
                            >
                                <TbSearch
                                    className={`text-2xl mr-2 text-slate-400 ${
                                        search && data.nodes.length == 0 ? "!text-red-500" : search && "!text-sky-500"
                                    } transition-all`}
                                />
                                <input
                                    name="search"
                                    id="search_category"
                                    className="w-full py-2 outline-none rounded-lg dark:bg-slate-800 transition-all"
                                    placeholder="Search by Sales Name"
                                    onChange={handleSearch}
                                />
                            </label>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400 hover:dark:bg-slate-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all"
                                    onClick={() => (openFilter ? setOpenFilter(false) : setOpenFilter(true))}
                                >
                                    <TbAdjustmentsHorizontal className="font-bold text-xl" /> Filter
                                </div>
                                <AnimatePresence>
                                    {openFilter && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute bg-white min-w-60 p-3 px-4 text-slate-800 right-0 top-12 shadow-xl rounded-lg border-2 z-10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                                        >
                                            <div className="w-full flex justify-between items-center border-b-2 dark:border-slate-600 pb-3 mb-3">
                                                <p className="text-xl font-bold">Filter</p>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 rounded-lg bg-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400 hover:dark:bg-slate-600 transition-all"
                                                    onClick={handleResetFilter}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-2 mb-3">
                                                <SelectInput
                                                    name="supplier_id"
                                                    label="Agent"
                                                    placeholder="Select Agent"
                                                    options={supplierFilterOptions}
                                                    value={supplierFilter.value}
                                                    type="filter"
                                                    onChange={(selected) => setSupplierFilter({ bool: true, value: selected.value })}
                                                />
                                                <SelectInput
                                                    name="product_category_id"
                                                    label="Customer"
                                                    placeholder="Select Agent"
                                                    options={categoriesFilterOptions}
                                                    formatOptionLabel={categoriesFormatSelect}
                                                    value={categoryFilter.value}
                                                    type="filter"
                                                    onChange={(selected) => setCategoryFilter({ bool: true, value: selected.value })}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Link
                                href={route("product.create")}
                                className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                            >
                                <TbPlus className="font-bold text-xl" /> Add Sales
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                    <div className="max-h-[38rem] min-w-[640px] relative">
                        <Table
                            data={data}
                            className="text-lg mt-3 !table-fixed max-h-[38rem] !border-b-2 dark:border-slate-600"
                            theme={tableTheme}
                            sort={sort}
                            layout={{ fixedHeader: true, custom: true }}
                            pagination={pagination}
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
                                                Sales
                                            </HeaderCellSort>
                                            <HeaderCellSort className="!py-2 !px-3 border-y-2 dark:border-slate-600" sortKey="PRICE">
                                                Price
                                            </HeaderCellSort>
                                            <HeaderCellSort className="!py-2 !px-3 border-y-2 dark:border-slate-600" sortKey="STOCK">
                                                Stock
                                            </HeaderCellSort>
                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Customer</HeaderCell>
                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Agent</HeaderCell>
                                            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                Action
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
                                                    <Cell className="!p-3 ">
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
                                                        <motion.div
                                                            className="whitespace-normal"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                        >
                                                            Rp{item.price.toLocaleString()}
                                                        </motion.div>
                                                    </Cell>
                                                    <Cell className="!p-3">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                        >
                                                            <span className="text-lg">{item.stock}</span>
                                                        </motion.div>
                                                    </Cell>
                                                    <Cell className="!p-3">
                                                        {item.product_category_id ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.05 }}
                                                                className={`w-fit px-3 font-bold rounded-lg`}
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
                                                                <span className="text-lg">None</span>
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
                                                    <Cell className="!p-3 rounded-r-xl">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                            className="flex gap-3 justify-center"
                                                        >
                                                            <Link href={route("product.edit", item.id)}>
                                                                <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                                            </Link>
                                                            <TbTrash
                                                                className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                                                onClick={() => setModalDelete(item.id)}
                                                            />
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
                                                    No Data Found
                                                </p>
                                                <p className="text-slate-400 dark:text-slate-500 mt-3">Couldn't find any data</p>
                                            </Cell>
                                        )}
                                    </Body>
                                </>
                            )}
                        </Table>
                    </div>
                    </div>
                    <div className="w-full mt-5 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400">Rows per page</span>
                            <Select
                                menuPlacement="top"
                                options={rowsSizeOptions}
                                defaultValue={rowsSizeOptions.find((options) => options.value === rowsSize)}
                                onChange={handleRowsSizeChange}
                                isSearchable={false}
                                classNames={{
                                    control: ({ isFocused }) =>
                                        classNames(
                                            "!border-2 !outline-none !rounded-xl dark:!bg-slate-800",
                                            isFocused
                                                ? "!border-sky-200 dark:!border-sky-500 dark:!border-opacity-20"
                                                : "!border-slate-200 dark:!border-slate-600"
                                        ),
                                    singleValue: () => classNames("!text-slate-500 dark:!text-slate-400"),
                                    dropdownIndicator: () => classNames("dark:!text-slate-400"),
                                    indicatorSeparator: () => classNames("hidden"),
                                    menu: () => classNames("!rounded-xl dark:!bg-slate-800"),
                                    option: ({ isSelected, isFocused }) => classNames(isSelected && "!bg-sky-400", isFocused && "dark:!bg-slate-600"),
                                }}
                                classNamePrefix="react-select"
                            />
                        </div>
                        <PaginationButton pagination={pagination} data={data} />
                        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 w-52">
                            Total page
                            <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 font-bold p-2 text-sm rounded-lg ml-1">
                                {pagination.state.getTotalPages(data.nodes)}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Sales;
