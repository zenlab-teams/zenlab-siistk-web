# Plan 00c — DataTable: Server-side Sorting, Searching, Pagination

## Context

Plan 00 + 00b menghasilkan DataTable yang bekerja sepenuhnya di client-side: semua data
di-load sekaligus, filter/sort/pagination dilakukan di browser. Ini tidak scalable — halaman
Order atau Stock yang punya ribuan baris akan lambat.

Revisi ini memindahkan keempat operasi (search, sort, per_page, pagination) ke server via
Inertia `router.get()` dengan query params. Controller mengembalikan satu halaman data
(Laravel `paginate()`), bukan seluruh koleksi.

Bergantung pada Plan 00b (columns API) yang sudah selesai.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Components/DataTable.jsx` | Ganti client-side hooks → Inertia router navigation |
| `resources/js/Components/button/PaginationButton.jsx` | Rewrite API: `pagination`+`data` → `currentPage`+`totalPages`+`onPageChange` |
| `app/Http/Controllers/Admin/ProductController.php` | `index()`: `get()` → `paginate()` + query params |
| `resources/js/Pages/Product/Index.jsx` | Update props: `products` → `products.data` + tambah `filters` |
| `resources/js/Pages/Customer/Index.jsx` | Sama, update saat CustomerController diimplementasi |

---

## Props API Baru — DataTable

```jsx
<DataTable
    nodes={products.data}          // array items dari paginator (bukan full collection)
    meta={products}                // objek paginator Laravel: current_page, last_page, total, per_page
    filters={filters}              // { search, sort, direction, per_page } dari controller
    routeName="product.index"      // dipakai untuk router.get() navigation

    // Tidak berubah:
    columns={[...]}
    gridLayout="..."
    selectable={true}
    deleteType="product"
    deleteDescription="..."
    title="Products"
    addHref={route("product.create")}
    addLabel="Add Product"
    toolbar={null}
/>
```

### Props yang dihapus
- `sortFns` — tidak lagi diperlukan (sort dilakukan server-side)

### sortKey convention berubah
sortKey sekarang harus sama dengan nama kolom DB (lowercase), karena dikirim ke controller:
```js
// Sebelum (00b):  sortKey: "NAME"
// Sesudah (00c):  sortKey: "name"
// Sebelum:        sortKey: "PRICE"
// Sesudah:        sortKey: "price"
// Sebelum:        sortKey: "STOCK"
// Sesudah:        sortKey: "stocks_sum_quantity"
```

---

## DataTable.jsx — Implementation

### Imports yang berubah
```js
// Hapus:
import { HeaderCellSort, SortToggleType, useSort } from "@table-library/react-table-library/sort";
import { usePagination } from "@table-library/react-table-library/pagination";

// Tambah:
import { router } from "@inertiajs/react";
import { useRef } from "react";

// Tetap ada:
import { useRowSelect } from "@table-library/react-table-library/select";
import { Body, Cell, Header, HeaderCell, HeaderRow, Row, Table } from "@table-library/react-table-library/table";
```

### Props destructuring baru
```js
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
```

### State & refs
```js
const rowsSizeOptions = tableRowsSizeOptions();
const tableTheme = tableStyle(gridLayout);
const searchTimeout = useRef(null);

const [search, setSearch] = useState(filters.search ?? '');
const [selectedItem, setSelectedItem] = useState([]);
const [modalDelete, setModalDelete] = useState(null);
const [modalDeleteSelected, setModalDeleteSelected] = useState(null);

// Sync search input jika filters berubah dari luar (back button, dll.)
useEffect(() => {
    setSearch(filters.search ?? '');
}, [filters.search]);

const data = useMemo(() => ({ nodes }), [nodes]);

const select = useRowSelect(data, {
    onChange: (_, state) => setSelectedItem(state.ids),
});
```

### Handler functions
```js
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
        filters.sort === sortKey && filters.direction === 'asc' ? 'desc' : 'asc';
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
    return filters.direction === 'asc'
        ? <FaSortUp fontSize="small" />
        : <FaSortDown fontSize="small" />;
};
```

### Table component — tanpa sort dan pagination props
```jsx
<Table
    data={data}
    className="text-lg mt-3 !table-fixed max-h-[38rem] !border-b-2 dark:border-slate-600"
    theme={tableTheme}
    layout={{ fixedHeader: true, custom: true }}
    select={selectable ? select : undefined}
    // Tidak ada: sort={sort}, pagination={pagination}
>
```

### Header cell rendering — sortable column pakai HeaderCell + onClick
```jsx
{columns.map((col, index) => {
    const isFirst = !selectable && index === 0;
    const isLast = index === columns.length - 1;
    const baseClass = "!py-2 !px-3 border-y-2 dark:border-slate-600";
    const firstClass = isFirst ? "border-s-2 rounded-s-xl" : "";
    const lastClass = isLast
        ? "rounded-r-xl border-r-2 border-slate-200 dark:border-slate-600"
        : "border-slate-200";
    const className = col.headerClassName ?? `${baseClass} ${firstClass} ${lastClass}`;

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
```

### Footer — ganti PaginationButton props
```jsx
// Sebelum:
<PaginationButton pagination={pagination} data={data} />

// Sesudah:
<PaginationButton
    currentPage={meta.current_page}
    totalPages={meta.last_page}
    onPageChange={handlePageChange}
/>
```

### Rows per page Select — ganti handler + default value
```jsx
<Select
    menuPlacement="top"
    options={rowsSizeOptions}
    defaultValue={rowsSizeOptions.find((o) => o.value === (filters.per_page ?? 10))}
    onChange={handlePerPageChange}
    // ... classNames sama
/>
```

### Total count — gunakan meta.total bukan nodes.length
```jsx
// Sebelum:
<span>...{nodes.length}</span>

// Sesudah:
<span>...{meta.total}</span>
```

### Total page — gunakan meta.last_page
```jsx
// Sebelum:
{pagination.state.getTotalPages(data.nodes)}

// Sesudah:
{meta.last_page}
```

---

## PaginationButton.jsx — Rewrite

API baru: tidak bergantung pada `@table-library` sama sekali.

```jsx
const PaginationButton = ({ currentPage, totalPages, onPageChange }) => {
    const [isAllPageOpen, setIsAllPageOpen] = useState(false);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-3">
            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            >
                <IoIosArrowBack />
            </button>

            {/* Logika tampil halaman sama persis dengan sebelumnya, tapi:
                - Ganti: pagination.fns.onSetPage(i)  → onPageChange(i + 1)
                - Ganti: currentPage (0-indexed)      → currentPage - 1 (untuk perbandingan index)
                - Ganti: totalPage                    → totalPages
                - Ganti: pagination.state.getPages(data.nodes) → pages
            */}

            <button
                className="text-base p-2 text-sky-500 rounded-xl border-2 border-sky-200 hover:bg-sky-400 hover:text-white dark:border-sky-500 dark:border-opacity-20 dark:hover:text-slate-800 transition-all"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            >
                <IoIosArrowForward />
            </button>
        </div>
    );
};
```

> **Catatan penting:** Semua index di komponen ini sekarang **1-based** (sesuai Laravel paginator),
> bukan 0-based seperti sebelumnya. Halaman aktif = `currentPage`, bukan `currentPage + 1`.

---

## ProductController.php — index()

```php
public function index(Request $request): Response
{
    $search    = $request->query('search', '');
    $sort      = $request->query('sort', 'created_at');
    $direction = $request->query('direction', 'desc');
    $perPage   = $request->query('per_page', 10);

    $allowedSorts = ['name', 'price', 'created_at', 'stocks_sum_quantity'];
    if (! in_array($sort, $allowedSorts, true)) {
        $sort = 'created_at';
    }
    if (! in_array($direction, ['asc', 'desc'], true)) {
        $direction = 'desc';
    }

    $products = Product::query()
        ->select(['id', 'name', 'description', 'price'])
        ->withSum('stocks', 'quantity')
        ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
        ->orderBy($sort, $direction)
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('Product/Index', [
        'products' => $products,
        'filters'  => $request->only(['search', 'sort', 'direction', 'per_page']),
    ]);
}
```

`->withQueryString()` memastikan pagination links menyertakan semua query params yang ada.

---

## Product/Index.jsx — Usage update

```jsx
const ProductIndex = ({ flash, products, filters }) => {
    // ...
    return (
        <DataTable
            nodes={products.data}        // bukan products langsung
            meta={products}              // current_page, last_page, total, per_page
            filters={filters}
            routeName="product.index"
            searchPlaceholder="Search by Product Name"
            gridLayout="auto 1.5fr 1fr 1fr 2fr 0.7fr"
            title="Products"
            deleteType="product"
            deleteDescription="Are you sure to delete this product?"
            addHref={route("product.create")}
            addLabel="Add Product"
            columns={[
                {
                    key: "name",
                    label: "Name",
                    sortKey: "name",            // lowercase — nama kolom DB
                    // ...
                },
                {
                    key: "price",
                    label: "Price",
                    sortKey: "price",
                    // ...
                },
                {
                    key: "stock",
                    label: "Stock",
                    sortKey: "stocks_sum_quantity",
                    // ...
                },
                // ...
            ]}
        />
    );
};
```

---

## Dampak ke Plans 01-06

Semua halaman Index di plan 01-06 yang menggunakan `<DataTable>` perlu mengikuti pola baru:

1. **Controller** — gunakan `paginate()` + `withQueryString()`, return `filters` prop
2. **Page** — terima `{ data }` dari paginator, pass `nodes={resource.data}`, `meta={resource}`, `filters={filters}`, `routeName="resource.index"`
3. **sortKey di columns** — lowercase DB column name, bukan uppercase string
4. **Hapus** prop `sortFns` dari semua DataTable usage

Plans yang terimpak: 01 (Product/Index), 02 (Product/Index), 03 (User/Index), 04 (Order/Index), 06 (Offer/Index).

---

## Verification

1. `php artisan route:list --name=product` → routes tidak berubah
2. Buka Product/Index → data muncul (page 1, per_page default 10)
3. Ketik di search → URL berubah `?search=abc`, data terfilter, page reset ke 1
4. Klik header "Name" → URL `?sort=name&direction=asc`, data terurut
5. Klik header "Name" lagi → `direction=desc`
6. Klik header "Name" ketiga kali → `direction=asc` (toggle, bukan reset)
7. Ganti rows per page → URL `?per_page=25`, jumlah baris berubah
8. Navigasi halaman via PaginationButton → `?page=2`
9. Bulk delete masih berfungsi (select checkbox → Delete Selected)
10. Single delete masih berfungsi
11. `meta.total` tampil di title badge (bukan `nodes.length` dari current page)
12. `meta.last_page` tampil di "Total page" footer
