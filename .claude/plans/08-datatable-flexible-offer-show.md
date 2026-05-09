# Plan 08 — DataTable Flexible: Offer Show Pages

## Context

`Offer/Show.jsx` (admin) dan `Sales/Offer/Show.jsx` menggunakan dua pendekatan
tabel yang berbeda dan tidak konsisten:
- **Items Dibawa** — `@table-library` langsung (Table, Header, Body, dll.)
- **Sale Records** — HTML `<table>` plain

Keduanya harus diganti dengan `Components/DataTable.jsx`. DataTable saat ini
hanya mendukung mode server-side (paginated + search), sehingga perlu dua prop
baru agar bisa dipakai untuk array statis tanpa search/pagination.

---

## 1. DataTable — Tambah 2 Prop Baru

**File:** `resources/js/Components/DataTable.jsx`

### Prop `paginated` (default `true`)

```jsx
const DataTable = ({
    nodes,
    meta = null,        // ubah default dari required ke null
    routeName = null,   // ubah default dari required ke null
    ...
    paginated = true,   // NEW — false = static mode
    ...
})
```

| Area | `paginated=true` (existing) | `paginated=false` (new) |
|---|---|---|
| Title badge | `meta.total` | `nodes.length` |
| Search bar | tampil | hidden |
| Row `#` | `(meta.current_page-1) * per_page + rowIndex + 1` | `rowIndex + 1` |
| Footer (per-page, pagination, total page) | tampil | hidden |

### Prop `rowClassName` (default `null`)

```jsx
const DataTable = ({
    ...
    rowClassName = null,  // NEW — string | (item) => string
    ...
})
```

Dipakai di Row render:
```jsx
const resolvedRowClass =
    typeof rowClassName === "function"
        ? rowClassName(item)
        : (rowClassName ?? "dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all");

<Row key={item.id} item={item} className={resolvedRowClass}>
```

---

## 2. Offer/Show.jsx — Admin

**File:** `resources/js/Pages/Offer/Show.jsx`

### Import cleanup

```jsx
// Hapus:
import { Body, Cell, Header, HeaderCell, HeaderRow, Row, Table } from "@table-library/react-table-library/table";
import { tableStyle } from "../../config/tableConfig";

// Tambah:
import DataTable from "../../Components/DataTable";
```

Hapus pula variabel yang tidak dipakai lagi:
- `const itemTableTheme = tableStyle(...)`
- `const itemData = useMemo(() => ({ nodes: items }), [items])`
- Import `useMemo` jika tidak dipakai di tempat lain

### Section 2 — Items Dibawa

Ganti seluruh blok `<div className="overflow-x-auto">...</div>` (yang berisi Table table-library)
dengan:

```jsx
<DataTable
    nodes={items}
    paginated={false}
    selectable={false}
    gridLayout="auto 1.5fr 0.5fr 1fr"
    title="Items Dibawa"
    columns={[
        {
            key: "thumbnail",
            label: "Thumbnail",
            render: (item) =>
                item.product?.thumbnail ? (
                    <img
                        src={`/storage/${item.product.thumbnail}`}
                        className="w-12 h-12 object-cover rounded-lg mx-auto"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto">
                        <TbPhoto className="text-slate-400 dark:text-slate-500" />
                    </div>
                ),
        },
        { key: "name",          label: "Nama Produk",  render: (item) => item.product?.name ?? "-" },
        { key: "quantity",      label: "Qty Dibawa",   render: (item) => item.quantity },
        {
            key: "offered_price",
            label: "Harga Target",
            render: (item) => `Rp${Number(item.offered_price ?? 0).toLocaleString("id-ID")}`,
        },
    ]}
/>
```

Total Target footer tetap di bawah `<DataTable>` (di luar komponen, dalam card yang sama).

### Section 3 — Sale Records

Ganti `<div className="overflow-x-auto"><table>...</table></div>` dengan:

```jsx
<DataTable
    nodes={records}
    paginated={false}
    selectable={false}
    gridLayout="1.5fr 1fr 1fr 0.8fr 1fr"
    title="Sale Records"
    columns={[
        {
            key: "customer",
            label: "Customer",
            render: (record) =>
                record.customer?.name ?? (
                    <span className="italic text-slate-400 dark:text-slate-500">Walk-in</span>
                ),
        },
        { key: "sales",   label: "Sales",  render: (record) => record.sale?.user?.name ?? "-" },
        {
            key: "total",
            label: "Total",
            render: (record) =>
                `Rp${(record.items ?? [])
                    .reduce((s, i) => s + Number(i.subtotal ?? 0), 0)
                    .toLocaleString("id-ID")}`,
        },
        {
            key: "status",
            label: "Status",
            render: (record) => (
                <span className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${statusRecordClassMap[record.status] ?? statusRecordClassMap.pending}`}>
                    {record.status}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (record) =>
                offer.status === "active" && record.status === "pending" ? (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleApproveRecord(record.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-800 font-bold transition-all"
                        >
                            Acc
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRejectRecord(record.id)}
                            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 font-bold transition-all"
                        >
                            Tolak
                        </button>
                    </div>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500 block text-center">-</span>
                ),
        },
    ]}
/>
```

Hapus badge count `{records.length} records` dari header section — DataTable
sudah handle via `title` + badge `nodes.length`.

---

## 3. Sales/Offer/Show.jsx

**File:** `resources/js/Pages/Sales/Offer/Show.jsx`

Import cleanup identik dengan admin Show.

### Items Dibawa — persis sama dengan admin Show

### Sale Records — tanpa kolom Actions, pakai `rowClassName` untuk highlight

```jsx
<DataTable
    nodes={records}
    paginated={false}
    selectable={false}
    gridLayout="1.5fr 1fr 1fr 1fr"
    title="Sale Records"
    rowClassName={(record) => {
        const isMyRecord = Number(record.sale_id) === Number(currentSaleId);
        return isMyRecord
            ? "dark:!bg-slate-800 bg-sky-50 dark:!bg-sky-900/20 transition-all"
            : "dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all";
    }}
    columns={[
        {
            key: "customer",
            label: "Customer",
            render: (record) =>
                record.customer?.name ?? (
                    <span className="italic text-slate-400 dark:text-slate-500">Walk-in</span>
                ),
        },
        { key: "sales",  label: "Sales",  render: (record) => record.sale?.user?.name ?? "-" },
        {
            key: "total",
            label: "Total",
            render: (record) =>
                `Rp${(record.items ?? [])
                    .reduce((s, i) => s + Number(i.subtotal ?? 0), 0)
                    .toLocaleString("id-ID")}`,
        },
        {
            key: "status",
            label: "Status",
            render: (record) => (
                <span className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${statusRecordClassMap[record.status] ?? statusRecordClassMap.pending}`}>
                    {record.status}
                </span>
            ),
        },
    ]}
/>
```

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Components/DataTable.jsx` | Tambah prop `paginated`, `rowClassName`; ubah default `meta=null`, `routeName=null` |
| `resources/js/Pages/Offer/Show.jsx` | Ganti table-library + HTML table → DataTable; cleanup import |
| `resources/js/Pages/Sales/Offer/Show.jsx` | Sama dengan admin Show |

---

## Verification

1. Admin `/admin/offer/{id}`:
   - "Items Dibawa" — DataTable 4 kolom, no search, no pagination ✓
   - "Sale Records" — DataTable 5 kolom + Acc/Tolak saat active+pending ✓
   - Total Target footer tetap muncul di bawah Items ✓
2. Sales `/sales/offer/{id}`:
   - "Items Dibawa" — sama dengan admin ✓
   - "Sale Records" — 4 kolom, record milik sendiri highlight biru ✓
3. Semua Index pages yang sudah ada tidak berubah behavior ✓
