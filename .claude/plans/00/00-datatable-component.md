# Plan 00 — Reusable DataTable Component

## Context

Setiap halaman Index (Product, Customer, Order, dst.) mengulang ~150 baris boilerplate identik:
state management, hooks table, search input, delete selected button, pagination footer, empty
state, ModalDelete. Tujuan: ekstrak semua boilerplate ke satu component `DataTable.jsx` yang
reusable, lalu refactor Product/Index.jsx dan Customer/Index.jsx sebagai referensi implementasi.

Ini adalah **prerequisite** untuk semua plan lainnya — setiap halaman Index baru akan langsung
menggunakan component ini.

---

## File to Create

| File | Keterangan |
|---|---|
| `resources/js/Components/DataTable.jsx` | Reusable table component dengan semua boilerplate |

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Pages/Product/Index.jsx` | Refactor menggunakan `<DataTable>` (~370 baris → ~80 baris) |
| `resources/js/Pages/Customer/Index.jsx` | Refactor menggunakan `<DataTable>` |

---

## Component API

```jsx
<DataTable
    nodes={products}                    // array data — required
    searchKey="name"                    // field untuk filter — required
    searchPlaceholder="Search..."       // placeholder input search
    gridLayout="auto 1.5fr 1fr 0.5fr"  // CSS grid-template-columns — required
    sortFns={{ NAME: (arr) => [...] }}  // sort functions, key = sortKey
    selectable={true}                   // aktifkan checkbox & bulk delete (default: true)
    deleteType="product"                // entity type untuk ModalDelete
    deleteDescription="Are you sure to delete this product?"
    title="Products"                    // judul + badge count
    addHref={route("product.create")}   // URL tombol Add; null = disembunyikan
    addLabel="Add Product"
    toolbar={null}                      // optional slot (misal: Filter button)
    headers={<>...</>}                  // header cells JSX tanpa checkbox cell
>
    {({ item, select, onDelete }) => (
        // cells JSX tanpa <Row> wrapper — DataTable render Row + checkbox otomatis
        <>
            <Cell className="!p-3">{item.name}</Cell>
            <Cell className="!p-3">
                <TbTrash onClick={() => onDelete(item.id)} />
            </Cell>
        </>
    )}
</DataTable>
```

---

## Props Specification

| Prop | Type | Default | Keterangan |
|---|---|---|---|
| `nodes` | `array` | required | Data array |
| `searchKey` | `string` | required | Field name untuk filter |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder search input |
| `gridLayout` | `string` | required | CSS grid-template-columns (termasuk `auto` untuk checkbox jika selectable) |
| `sortFns` | `object` | `{}` | Sort functions, key = sortKey string |
| `selectable` | `boolean` | `true` | Aktifkan checkbox + bulk delete |
| `deleteType` | `string` | `null` | Entity type untuk ModalDelete |
| `deleteDescription` | `string` | `""` | Teks konfirmasi single delete |
| `title` | `string` | `""` | Judul di atas tabel |
| `addHref` | `string` | `null` | URL tombol Add; null = hidden |
| `addLabel` | `string` | `"Add"` | Label tombol Add |
| `toolbar` | `node` | `null` | Slot tambahan di toolbar |
| `headers` | `node` | required | JSX header cells (tanpa checkbox cell) |
| `children` | `function` | required | Render prop `({ item, select, onDelete })` |

---

## DataTable Internal Implementation

### State
```js
const [search, setSearch] = useState("")
const [rowsSize, setRowsSize] = useState(rowsSizeOptions[2].value)
const [selectedItem, setSelectedItem] = useState([])
const [modalDelete, setModalDelete] = useState(null)
const [modalDeleteSelected, setModalDeleteSelected] = useState(null)
```

### Hooks
```js
const rowsSizeOptions = tableRowsSizeOptions()
const tableTheme = tableStyle(gridLayout)
const filteredNodes = useMemo(
    () => nodes.filter(item =>
        String(item[searchKey] ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [nodes, search, searchKey]
)
const data = useMemo(() => ({ nodes: filteredNodes }), [filteredNodes])
const pagination = usePagination(data, { state: { page: 0, size: rowsSize } })
const select = useRowSelect(data, {
    onChange: (_, state) => setSelectedItem(state.ids),
})
const sort = useSort(data, {}, {
    sortToggleType: SortToggleType.AlternateWithReset,
    sortIcon: {
        margin: "8px",
        iconDefault: <FaSort fontSize="small" />,
        iconUp: <FaSortUp fontSize="small" />,
        iconDown: <FaSortDown fontSize="small" />,
    },
    sortFns,
})
```

### Render Structure
```jsx
<>
    {/* Modals */}
    <AnimatePresence>
        {modalDelete
            ? <ModalDelete itemID={modalDelete} type={deleteType} closeModal={setModalDelete} description={deleteDescription} />
            : modalDeleteSelected && (
                <ModalDelete
                    itemID={modalDeleteSelected}
                    type={`${deleteType}_selected`}
                    closeModal={setModalDeleteSelected}
                    description={`Are you sure to delete ${selectedItem.length} selected items?`}
                />
            )
        }
    </AnimatePresence>

    {/* Toolbar */}
    <div className="flex flex-wrap justify-between items-center gap-2">
        <p className="text-xl font-bold">
            {title}
            <span className="bg-slate-200 dark:bg-slate-700 ... ml-1">{nodes.length}</span>
        </p>
        <div className="flex items-center gap-3">
            <AnimatePresence>
                {selectedItem.length > 0 && (
                    <motion.button onClick={() => setModalDeleteSelected(selectedItem)} ...>
                        <TbTrash /> <span>{selectedItem.length}</span> Delete Selected
                    </motion.button>
                )}
            </AnimatePresence>
            {/* Search input */}
            {toolbar}
            {addHref && (
                <Link href={addHref} className="... bg-emerald-400 ...">
                    <TbPlus /> {addLabel}
                </Link>
            )}
        </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
        <div className="max-h-[38rem] min-w-[640px]">
            <Table data={data} theme={tableTheme} sort={sort} pagination={pagination} select={select}
                   className="text-lg mt-3 !table-fixed max-h-[38rem] !border-b-2 dark:border-slate-600"
                   layout={{ fixedHeader: true, custom: true }}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow className="!bg-slate-100 dark:!bg-slate-700 ..." layout={{ custom: true }}>
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
                                {headers}
                            </HeaderRow>
                        </Header>
                        <Body>
                            {tableList.length > 0
                                ? tableList.map(item => (
                                    <Row key={item.id} item={item}
                                         className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all">
                                        {selectable && (
                                            <Cell className="!p-3">
                                                <CheckboxInput
                                                    name={`tableItemSelect${item.id}`}
                                                    checked={select.state.ids.includes(item.id)}
                                                    onChange={() => select.fns.onToggleById(item.id)}
                                                />
                                            </Cell>
                                        )}
                                        {children({ item, select, onDelete: setModalDelete })}
                                    </Row>
                                ))
                                : (
                                    <Cell gridColumnStart={1} gridColumnEnd={100}
                                          className="h-[25rem] *:!h-full *:flex *:items-center *:justify-center *:flex-col">
                                        <img src={NoData} className="w-52" />
                                        <p className="text-2xl py-2 px-5 bg-slate-200 text-slate-400 font-bold rounded-xl mt-8 dark:text-slate-500 dark:bg-slate-700">
                                            No Data Found
                                        </p>
                                        <p className="text-slate-400 dark:text-slate-500 mt-3">Couldn't find any data</p>
                                    </Cell>
                                )
                            }
                        </Body>
                    </>
                )}
            </Table>
        </div>
    </div>

    {/* Footer */}
    <div className="w-full mt-5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400">Rows per page</span>
            <Select menuPlacement="top" options={rowsSizeOptions} ... onChange={handleRowsSizeChange} />
        </div>
        <PaginationButton pagination={pagination} data={data} />
        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 w-52">
            Total page
            <span className="...">{pagination.state.getTotalPages(data.nodes)}</span>
        </div>
    </div>
</>
```

---

## Refactored Product/Index.jsx (hasil akhir ~80 baris)

```jsx
const ProductIndex = ({ flash, products }) => {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setCurrentRoute({ route: "product", subRoute: "master" })); }, []);

    return (
        <Layout flash={flash}>
            <Head><title>Products | TelatenKarya</title></Head>
            <Sidebar />
            <section className="sm:ml-80 p-8">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">List of all products</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <DataTable
                        nodes={products}
                        searchKey="name"
                        searchPlaceholder="Search by Product Name"
                        gridLayout="auto 1.5fr 1fr 1fr 2fr 0.5fr"
                        sortFns={{
                            NAME:  (arr) => arr.sort((a, b) => a.name.localeCompare(b.name)),
                            PRICE: (arr) => arr.sort((a, b) => a.price - b.price),
                            STOCK: (arr) => arr.sort((a, b) => (a.stocks_sum_quantity ?? 0) - (b.stocks_sum_quantity ?? 0)),
                        }}
                        title="Products"
                        deleteType="product"
                        deleteDescription="Are you sure to delete this product?"
                        addHref={route("product.create")}
                        addLabel="Add Product"
                        headers={<>
                            <HeaderCellSort sortKey="NAME" className="!py-2 !px-3 border-y-2 border-slate-200 dark:border-slate-600 hover:text-sky-500 transition-all">Name</HeaderCellSort>
                            <HeaderCellSort sortKey="PRICE" className="!py-2 !px-3 border-y-2 dark:border-slate-600">Price</HeaderCellSort>
                            <HeaderCellSort sortKey="STOCK" className="!py-2 !px-3 border-y-2 dark:border-slate-600">Stock</HeaderCellSort>
                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">Description</HeaderCell>
                            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">Action</HeaderCell>
                        </>}
                    >
                        {({ item, onDelete }) => (
                            <>
                                <Cell className="!p-3">
                                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="whitespace-normal font-medium">
                                        {item.name}
                                    </motion.div>
                                </Cell>
                                <Cell className="!p-3">
                                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                        Rp{item.price.toLocaleString('id-ID')}
                                    </motion.div>
                                </Cell>
                                <Cell className="!p-3">
                                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                        {item.stocks_sum_quantity ?? 0}
                                    </motion.div>
                                </Cell>
                                <Cell className="!p-3">
                                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="whitespace-normal text-slate-500 dark:text-slate-400">
                                        {item.description ?? '-'}
                                    </motion.div>
                                </Cell>
                                <Cell className="!p-3">
                                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-3 justify-center">
                                        <Link href={route("product.edit", item.id)}>
                                            <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                                        </Link>
                                        <TbTrash
                                            className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                            onClick={() => onDelete(item.id)}
                                        />
                                    </motion.div>
                                </Cell>
                            </>
                        )}
                    </DataTable>
                </div>
            </section>
        </Layout>
    );
};
```

---

## Utilities to Reuse

| Utility | Path |
|---|---|
| `tableStyle()`, `tableRowsSizeOptions()` | `resources/js/config/tableConfig.jsx` |
| `PaginationButton` | `resources/js/Components/button/PaginationButton.jsx` |
| `CheckboxInput` | `resources/js/Components/input/CheckboxInput.jsx` |
| `ModalDelete` | `resources/js/Components/modal/ModalDelete.jsx` |
| `NoData` SVG | `resources/assets/image/NoData.svg` |

---

## Verification

1. Product/Index tampil identik dengan sebelumnya (layout, sorting, search, pagination, delete)
2. Customer/Index tampil identik dengan sebelumnya
3. Bulk delete berfungsi (select all → delete selected → ModalDelete muncul)
4. Single row delete berfungsi (klik trash → ModalDelete → konfirmasi → redirect)
5. Search real-time filter + reset ke halaman 0
6. Pagination + rows-per-page berfungsi
7. Dark mode tampil benar di semua state
8. Empty state (NoData) muncul saat tidak ada hasil search
