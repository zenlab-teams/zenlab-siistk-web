# Plan 00b — DataTable: Revisi API ke `columns` Prop

## Context

Plan 00 berhasil mengekstrak boilerplate table ke `DataTable.jsx`, tapi pages masih harus
import `Cell`, `HeaderCell`, `HeaderCellSort` dari `@table-library` dan menulis render prop
`{({ item, onDelete }) => (...)}`. Revisi ini mengganti `headers` + render prop children
dengan satu prop `columns` (array of column definitions) sehingga DataTable benar-benar
self-contained — pages tidak perlu tahu internals `@table-library` sama sekali.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Components/DataTable.jsx` | Ganti props `headers` + `children` → `columns` |
| `resources/js/Pages/Product/Index.jsx` | Pakai API baru + fix title + fix sort key |
| `resources/js/Pages/Customer/Index.jsx` | Pakai API baru + fix title + fix sort key |

---

## Column Definition Shape

```js
{
    key: string,              // required — unique identifier, dipakai sebagai React key
    label: string,            // required — teks header
    sortKey?: string,         // optional — jika ada, header pakai HeaderCellSort
    headerClassName?: string, // optional — override className header cell
    cellClassName?: string,   // optional — override className body cell
    render: (item, { onDelete }) => ReactNode,  // required — isi cell
}
```

---

## New API (menggantikan `headers` + `children`)

**Sebelum:**
```jsx
<DataTable
    headers={
        <>
            <HeaderCellSort className="!py-2 !px-3 border-y-2 ..." sortKey="NAME">Name</HeaderCellSort>
            <HeaderCell className="!py-2 !px-3 border-y-2 ...">Description</HeaderCell>
            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 ...">Action</HeaderCell>
        </>
    }
>
    {({ item, onDelete }) => (
        <>
            <Cell className="!p-3">{item.name}</Cell>
            <Cell className="!p-3 text-slate-500">{item.description}</Cell>
            <Cell className="!p-3 rounded-r-xl">
                <TbTrash onClick={() => onDelete(item.id)} />
            </Cell>
        </>
    )}
</DataTable>
```

**Sesudah:**
```jsx
<DataTable
    columns={[
        {
            key: 'name',
            label: 'Name',
            sortKey: 'NAME',
            render: (item) => (
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    {item.name}
                </motion.div>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            cellClassName: '!p-3 text-slate-500 dark:text-slate-400',
            render: (item) => item.description ?? '-',
        },
        {
            key: 'actions',
            label: 'Action',
            render: (item, { onDelete }) => (
                <div className="flex gap-3 justify-center">
                    <Link href={route("product.edit", item.id)}>
                        <TbEdit className="text-3xl text-slate-500 hover:text-sky-500 transition-all" />
                    </Link>
                    <TbTrash
                        className="text-3xl text-slate-500 hover:text-red-500 transition-all"
                        onClick={() => onDelete(item.id)}
                    />
                </div>
            ),
        },
    ]}
/>
```

---

## DataTable.jsx — Implementation

### Props yang berubah

```js
// Hapus:
// headers,
// children,

// Tambah:
// columns,
```

### Header rendering

```jsx
// Sebelum:
{headers}

// Sesudah:
{columns.map((col, index) => {
    const isFirst = !selectable && index === 0;
    const isLast = index === columns.length - 1;
    const baseClass = `!py-2 !px-3 border-y-2 dark:border-slate-600`;
    const firstClass = isFirst ? 'border-s-2 rounded-s-xl' : '';
    const lastClass = isLast ? 'rounded-r-xl border-r-2 border-slate-200 dark:border-slate-600' : 'border-slate-200';
    const hoverClass = col.sortKey ? 'hover:text-sky-500 transition-all' : '';
    const className = col.headerClassName ?? `${baseClass} ${firstClass} ${lastClass} ${hoverClass}`;

    return col.sortKey ? (
        <HeaderCellSort key={col.key} className={className} sortKey={col.sortKey}>
            {col.label}
        </HeaderCellSort>
    ) : (
        <HeaderCell key={col.key} className={className}>
            {col.label}
        </HeaderCell>
    );
})}
```

### Body cell rendering

```jsx
// Sebelum:
{children({ item, select, onDelete: setModalDelete })}

// Sesudah:
{columns.map((col, index) => {
    const isLast = index === columns.length - 1;
    const baseClass = '!p-3';
    const lastClass = isLast ? 'rounded-r-xl' : '';
    const className = col.cellClassName ?? `${baseClass} ${lastClass}`;

    return (
        <Cell key={col.key} className={className}>
            {col.render(item, { onDelete: setModalDelete })}
        </Cell>
    );
})}
```

### sortFns — auto-derive dari columns

`sortFns` bisa tetap explicit (lebih fleksibel untuk custom sort logic), tapi DataTable harus
tetap menerima `sortFns` prop karena sort function per kolom berbeda-beda dan tidak bisa
di-derive dari column definition.

---

## Fixes Sekalian (Issues dari Review)

### Product/Index.jsx
- Fix: `<title>Products | TelatenKarya</title>` (bukan "AgentApp")
- Remove: import `Cell`, `HeaderCell`, `HeaderCellSort` dari `@table-library`

### Customer/Index.jsx
- Fix: `<title>Customer | TelatenKarya</title>`
- Fix: sort key `CATEGORYNAME` → `NAME` (di `sortFns` dan `sortKey` column definition)
- Remove: import `Cell`, `HeaderCell`, `HeaderCellSort` dari `@table-library`

---

## AGENTS.md Update

Setelah implementasi, update contoh penggunaan DataTable di `AGENTS.md` agar model lain
langsung pakai API `columns` yang baru.

---

## Verification

1. Product/Index tampil identik dengan sebelumnya (semua kolom, sort, pagination, delete)
2. Customer/Index tampil identik
3. Tidak ada import `@table-library` di Product/Index maupun Customer/Index
4. Klik header "Name" → sort asc/desc bekerja (HeaderCellSort auto-applied via sortKey)
5. Kolom "Action" tidak punya sort arrow (tidak ada sortKey)
6. Page title menampilkan "TelatenKarya" bukan "AgentApp"
7. Customer sort by name bekerja dengan sort key `NAME`
