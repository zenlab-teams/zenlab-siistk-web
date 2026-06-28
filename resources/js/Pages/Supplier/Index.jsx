import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { TbDotsVertical, TbEdit, TbPlus, TbSearch, TbTrash } from "react-icons/tb";
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

const Agent = ({ flash, suppliers }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "supplier", subRoute: null }));
    }, []);

    const tableTheme = tableStyle("auto 1fr 1fr 1fr 1fr 0.5fr");

    const [supplierData, setSupplierData] = useState(suppliers);
    const [search, setSearch] = useState("");
    const [modalDelete, setModalDelete] = useState(null);
    const [modalDeleteSelected, setModalDeleteSelected] = useState(null);
    const [selectedItem, setSelectedItem] = useState([]);

    const rowsSizeOptions = tableRowsSizeOptions();

    const [rowsSize, setRowsSize] = useState(rowsSizeOptions[2].value);

    const data = { nodes: supplierData.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())) };

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
                CATEGORYNAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
            },
        }
    );

    return (
        <Layout flash={flash}>
            <Head>
                <title>Pemasok | TelatenKarya</title>
            </Head>
            <Sidebar />
            <AnimatePresence>
                {modalDelete ? (
                    <ModalDelete
                        itemID={modalDelete}
                        closeModal={(id = null) => setModalDelete(id)}
                        type="supplier"
                        description="Apakah Anda yakin ingin menghapus pemasok ini?"
                    />
                ) : (
                    modalDeleteSelected && (
                        <ModalDelete
                            itemID={modalDeleteSelected}
                            closeModal={(id = null) => setModalDeleteSelected(id)}
                            type="supplier_selected"
                            description={"Apakah Anda yakin ingin menghapus " + selectedItem.length + " pemasok terpilih?"}
                        />
                    )
                )}
            </AnimatePresence>
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Pemasok</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Daftar Semua Pemasok</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center">
                        <p className="text-xl font-bold">
                            Pemasok
                            <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 p-2 rounded-lg text-lg ml-1">
                                {supplierData.length}
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
                                        <span>{selectedItem.length}</span>Hapus Terpilih
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
                                    placeholder="Cari Nama Pemasok"
                                    onChange={handleSearch}
                                />
                            </label>
                            <Link
                                href={route("supplier.create")}
                                className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                            >
                                <TbPlus className="font-bold text-xl" /> Tambah Pemasok
                            </Link>
                        </div>
                    </div>
                    <div className="max-h-[38rem] relative">
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
                                                sortKey="CATEGORYNAME"
                                            >
                                                Pemasok
                                            </HeaderCellSort>
                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Alamat</HeaderCell>
                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Kontak</HeaderCell>
                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Total Produk</HeaderCell>
                                            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                Aksi
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
                                                            className="w-fit rounded-lg"
                                                        >
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
                                                            {item.address}
                                                        </motion.div>
                                                    </Cell>
                                                    <Cell className="!p-3">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                            className="flex flex-col"
                                                        >
                                                            <span className="text-lg">{item.email}</span>
                                                            <span className="text-sm text-slate-500 ">{item.number_phone}</span>
                                                        </motion.div>
                                                    </Cell>
                                                    <Cell className="!p-3">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                        >
                                                            {item.products_count}
                                                        </motion.div>
                                                    </Cell>
                                                    <Cell className="!p-3 rounded-r-xl">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 }}
                                                            className="flex gap-3 justify-center"
                                                        >
                                                            <Link href={route("supplier.edit", item.id)}>
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
                    <div className="w-full mt-5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400">Baris per halaman</span>
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
                            Total halaman
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

export default Agent;
