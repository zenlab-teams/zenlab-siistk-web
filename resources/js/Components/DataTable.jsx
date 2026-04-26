import { Link, router } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { TbPlus, TbSearch, TbTrash } from "react-icons/tb";
import { Body, Cell, Header, HeaderCell, HeaderRow, Row, Table } from "@table-library/react-table-library/table";
import { useRowSelect } from "@table-library/react-table-library/select";
import classNames from "classnames";
import Select from "react-select";
import NoData from "../../assets/image/NoData.svg";
import PaginationButton from "./button/PaginationButton";
import CheckboxInput from "./input/CheckboxInput";
import ModalDelete from "./modal/ModalDelete";
import { tableRowsSizeOptions, tableStyle } from "../config/tableConfig";

const DataTable = ({
    nodes,
    meta,
    filters = {},
    routeName,
    searchPlaceholder = "Search...",
    gridLayout,
    selectable = true,
    deleteType = null,
    deleteDescription = "",
    title = "",
    addHref = null,
    addLabel = "Add",
    toolbar = null,
    columns = [],
}) => {
    const rowsSizeOptions = tableRowsSizeOptions();
    const tableTheme = tableStyle(`${selectable ? 'auto ' : ''}auto ${gridLayout}`);
    const searchTimeout = useRef(null);

    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedItem, setSelectedItem] = useState([]);
    const [modalDelete, setModalDelete] = useState(null);
    const [modalDeleteSelected, setModalDeleteSelected] = useState(null);

    // Sync search input jika filters berubah dari luar (back button, dll.)
    useEffect(() => {
        setSearch(filters.search ?? "");
    }, [filters.search]);

    const data = useMemo(() => ({ nodes }), [nodes]);

    const select = useRowSelect(data, {
        onChange: (_, state) => setSelectedItem(state.ids),
    });

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(
                route(routeName),
                { ...filters, search: value, page: 1 },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
    };

    const handleSort = (sortKey) => {
        const direction =
            filters.sort === sortKey && filters.direction === "asc" ? "desc" : "asc";
        router.get(
            route(routeName),
            { ...filters, sort: sortKey, direction, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handlePerPageChange = (selected) => {
        router.get(
            route(routeName),
            { ...filters, per_page: selected.value, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route(routeName),
            { ...filters, page },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const getSortIcon = (sortKey) => {
        if (filters.sort !== sortKey) return <FaSort fontSize="small" />;
        return filters.direction === "asc"
            ? <FaSortUp fontSize="small" />
            : <FaSortDown fontSize="small" />;
    };

    return (
        <>
            <AnimatePresence>
                {modalDelete ? (
                    <ModalDelete
                        itemID={modalDelete}
                        closeModal={(id = null) => setModalDelete(id)}
                        type={deleteType}
                        description={deleteDescription}
                    />
                ) : (
                    modalDeleteSelected && (
                        <ModalDelete
                            itemID={modalDeleteSelected}
                            closeModal={(id = null) => setModalDeleteSelected(id)}
                            type={`${deleteType}_selected`}
                            description={`Are you sure to delete ${selectedItem.length} selected items?`}
                        />
                    )
                )}
            </AnimatePresence>

            <div className="flex flex-wrap justify-between items-center gap-2">
                <p className="text-xl font-bold">
                    {title}
                    <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 p-2 rounded-lg text-lg ml-1">
                        {meta.total}
                    </span>
                </p>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {selectable && selectedItem.length > 0 && (
                            <motion.button
                                type="button"
                                className="flex items-center gap-2 bg-red-400 dark:bg-red-500 text-white dark:text-slate-800 hover:bg-red-500 dark:hover:bg-red-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                                onClick={() => setModalDeleteSelected(selectedItem)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <TbTrash className="font-bold text-xl" />
                                <span>{selectedItem.length}</span>
                                Delete Selected
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <label
                        htmlFor={`search_${routeName}`}
                        className={`flex items-center border-2 dark:border-slate-700 rounded-lg px-2 ${
                            search && data.nodes.length === 0
                                ? "!border-red-200 dark:!border-red-500 dark:!border-opacity-20"
                                : search && "border-sky-300 dark:!border-sky-500 dark:!border-opacity-20"
                        } transition-all`}
                    >
                        <TbSearch
                            className={`text-2xl mr-2 text-slate-400 ${
                                search && data.nodes.length === 0 ? "!text-red-500" : search && "!text-sky-500"
                            } transition-all`}
                        />
                        <input
                            name="search"
                            id={`search_${routeName}`}
                            className="w-full py-2 outline-none rounded-lg dark:bg-slate-800 transition-all"
                            placeholder={searchPlaceholder}
                            onChange={handleSearch}
                            value={search}
                        />
                    </label>

                    {toolbar}

                    {addHref && (
                        <Link
                            href={addHref}
                            className="flex items-center gap-2 bg-emerald-400 dark:bg-emerald-500 text-white dark:text-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all"
                        >
                            <TbPlus className="font-bold text-xl" /> {addLabel}
                        </Link>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="max-h-[38rem] min-w-[640px] relative">
                    <Table
                        data={data}
                        className="text-lg mt-3 !table-fixed max-h-[38rem] !border-b-2 dark:border-slate-600"
                        theme={tableTheme}
                        layout={{ fixedHeader: true, custom: true }}
                        select={selectable ? select : undefined}
                    >
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow
                                        className="!bg-slate-100 dark:!bg-slate-700 text-slate-500 dark:text-slate-400"
                                        layout={{ custom: true }}
                                    >
                                        {selectable && (
                                            <HeaderCell className="border-s-2 border-y-2 rounded-s-xl !py-2 !px-3 dark:border-slate-600">
                                                <CheckboxInput
                                                    name="tableSelect"
                                                    checked={select.state.all}
                                                    indeterminate={!select.state.all && !select.state.none}
                                                    onChange={select.fns.onToggleAll}
                                                />
                                            </HeaderCell>
                                        )}
                                        <HeaderCell
                                            className={`!py-2 !px-3 border-y-2 dark:border-slate-600 text-center text-sm${!selectable ? ' border-s-2 rounded-s-xl' : ''}`}
                                        >
                                            #
                                        </HeaderCell>
                                        {columns.map((col, index) => {
                                            const isLast = index === columns.length - 1;
                                            const baseClass = "!py-2 !px-3 border-y-2 dark:border-slate-600";
                                            const lastClass = isLast
                                                ? "rounded-r-xl border-r-2 border-slate-200 dark:border-slate-600"
                                                : "border-slate-200";
                                            const className = col.headerClassName ?? `${baseClass} ${lastClass}`;

                                            return col.sortKey ? (
                                                <HeaderCell
                                                    key={col.key}
                                                    className={`${className} cursor-pointer hover:text-sky-500 transition-all`}
                                                    onClick={() => handleSort(col.sortKey)}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {col.label}
                                                        <span className="ml-1">{getSortIcon(col.sortKey)}</span>
                                                    </div>
                                                </HeaderCell>
                                            ) : (
                                                <HeaderCell key={col.key} className={className}>
                                                    {col.label}
                                                </HeaderCell>
                                            );
                                        })}
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    {tableList.length > 0 ? (
                                        tableList.map((item, rowIndex) => (
                                            <Row
                                                key={item.id}
                                                item={item}
                                                className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all"
                                            >
                                                {selectable && (
                                                    <Cell className="!p-3">
                                                        <CheckboxInput
                                                            name={`tableItemSelect${item.id}`}
                                                            checked={select.state.ids.includes(item.id)}
                                                            onChange={() => select.fns.onToggleById(item.id)}
                                                        />
                                                    </Cell>
                                                )}
                                                <Cell className="!p-3 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
                                                    {(meta.current_page - 1) * Number(meta.per_page) + rowIndex + 1}
                                                </Cell>
                                                {columns.map((col, index) => {
                                                    const isLast = index === columns.length - 1;
                                                    const baseClass = "!p-3";
                                                    const lastClass = isLast ? "rounded-r-xl" : "";
                                                    const className = col.cellClassName ?? `${baseClass} ${lastClass}`;

                                                    return (
                                                        <Cell key={col.key} className={className}>
                                                            {col.render(item, { onDelete: setModalDelete })}
                                                        </Cell>
                                                    );
                                                })}
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
                                            <p className="text-slate-400 dark:text-slate-500 mt-3">Couldn&apos;t find any data</p>
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
                        defaultValue={rowsSizeOptions.find((o) => o.value === Number(filters.per_page ?? 10))}
                        onChange={handlePerPageChange}
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
                            option: ({ isSelected, isFocused }) =>
                                classNames(isSelected && "!bg-sky-400", isFocused && "dark:!bg-slate-600"),
                        }}
                        classNamePrefix="react-select"
                    />
                </div>

                <PaginationButton
                    currentPage={meta.current_page}
                    totalPages={meta.last_page}
                    onPageChange={handlePageChange}
                />

                <div className="text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 w-52">
                    Total page
                    <span className="bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 font-bold p-2 text-sm rounded-lg ml-1">
                        {meta.last_page}
                    </span>
                </div>
            </div>
        </>
    );
};

export default DataTable;
