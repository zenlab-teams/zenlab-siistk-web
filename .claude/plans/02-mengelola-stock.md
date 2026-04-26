# Plan 02 — Mengelola Stock

## Context

Integrasikan tabel `stocks` ke modul Product:
- Halaman **detail produk** (`Product/Show.jsx`) menampilkan info produk + tabel riwayat stock
- Form **Create/Edit** produk punya section opsional untuk inisialisasi/tambah stock entry
- Halaman **Stock/Create** (`Product/Stock/Create.jsx`) untuk tambah stock entry dari halaman detail

Tabel `stocks` sudah ada: `product_id, quantity, unit_cost, type (in/out/adjustment), reference_id, reference_type, note, created_by`.

Bergantung pada **Plan 01** (thumbnail) karena share beberapa file yang sama.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `app/Http/Requests/StoreProductRequest.php` | Tambah fields initial stock: `initial_quantity`, `initial_unit_cost`, `initial_note` |
| `app/Http/Requests/UpdateProductRequest.php` | Tambah fields stock entry: `stock_quantity`, `stock_type`, `stock_unit_cost`, `stock_note` |
| `app/Http/Controllers/Admin/ProductController.php` | Handle initial stock di `store()`; handle stock entry di `update()`; tambah `show()` |
| `routes/web.php` | Tambah `product.show`, `product.stock.create`, `product.stock.store` |
| `resources/js/Pages/Product/Index.jsx` | Tambah tombol Detail (icon Eye) di action column |
| `resources/js/Pages/Product/Create.jsx` | Tambah section "Initial Stock" (quantity, unit_cost, note) — opsional |
| `resources/js/Pages/Product/Edit.jsx` | Tambah section "Add Stock Entry" (type, quantity, unit_cost, note) — opsional |

---

## Files to Create

| File | Keterangan |
|---|---|
| `app/Http/Requests/StoreStockRequest.php` | Validasi stock entry dari halaman Stock/Create |
| `app/Http/Controllers/Admin/StockController.php` | `create()` dan `store()` |
| `resources/js/Pages/Product/Show.jsx` | Detail produk + tabel riwayat stock |
| `resources/js/Pages/Product/Stock/Create.jsx` | Form tambah stock entry standalone |

---

## Implementation Steps

### 1. Form Requests

**StoreProductRequest** — tambah:
```php
'initial_quantity'  => 'nullable|integer|min:1',
'initial_unit_cost' => 'nullable|integer|min:0',
'initial_note'      => 'nullable|string|max:255',
```

**UpdateProductRequest** — tambah:
```php
'stock_quantity'  => 'nullable|integer|min:1',
'stock_type'      => 'nullable|required_with:stock_quantity|in:in,out,adjustment',
'stock_unit_cost' => 'nullable|integer|min:0',
'stock_note'      => 'nullable|string|max:255',
```

**StoreStockRequest** (baru):
```php
'quantity'  => 'required|integer|min:1',
'type'      => 'required|in:in,out,adjustment',
'unit_cost' => 'nullable|integer|min:0',
'note'      => 'nullable|string|max:255',
```

### 2. ProductController — tambahan

**store()** — setelah product dibuat:
```php
$initialQty = $request->validated()['initial_quantity'] ?? null;
if ($initialQty) {
    $product->stocks()->create([
        'quantity'   => $initialQty,
        'unit_cost'  => $request->validated()['initial_unit_cost'] ?? null,
        'type'       => 'in',
        'note'       => $request->validated()['initial_note'] ?? 'Initial stock',
        'created_by' => auth()->id(),
    ]);
}
```
Gunakan `$request->safe()->except(['thumbnail', 'initial_quantity', 'initial_unit_cost', 'initial_note'])` saat create product.

**update()** — setelah product diupdate:
```php
$stockQty  = $request->validated()['stock_quantity'] ?? null;
$stockType = $request->validated()['stock_type'] ?? null;
if ($stockQty && $stockType) {
    $quantity = abs($stockQty);
    if ($stockType === 'out') {
        $quantity = -$quantity;
    }
    $product->stocks()->create([
        'quantity'   => $quantity,
        'unit_cost'  => $request->validated()['stock_unit_cost'] ?? null,
        'type'       => $stockType,
        'note'       => $request->validated()['stock_note'] ?? null,
        'created_by' => auth()->id(),
    ]);
}
```

**show()** — baru:
```php
public function show(Product $product): Response
{
    return Inertia::render('Product/Show', [
        'product'      => $product,
        'stocks'       => $product->stocks()
            ->select(['id', 'quantity', 'unit_cost', 'type', 'note', 'created_at'])
            ->latest()
            ->get(),
        'currentStock' => $product->currentStock(),
    ]);
}
```

### 3. StockController (baru)
```php
public function create(Product $product): Response
{
    return Inertia::render('Product/Stock/Create', [
        'product' => $product,
    ]);
}

public function store(StoreStockRequest $request, Product $product): RedirectResponse
{
    $quantity = abs($request->validated()['quantity']);
    if ($request->validated()['type'] === 'out') {
        $quantity = -$quantity;
    }
    $product->stocks()->create([
        'quantity'   => $quantity,
        'unit_cost'  => $request->validated()['unit_cost'] ?? null,
        'type'       => $request->validated()['type'],
        'note'       => $request->validated()['note'] ?? null,
        'created_by' => auth()->id(),
    ]);
    return redirect()->route('product.show', $product)
        ->with('success', 'Stock entry added successfully.');
}
```

### 4. Routes

Tambah di dalam product group, **SEBELUM** route `/{product}/edit`:

```php
use App\Http\Controllers\Admin\StockController;

Route::get('/{product}', 'show')->name('show');   // product.show

Route::controller(StockController::class)->group(function () {
    Route::get('/{product}/stock/create', 'create')->name('stock.create');
    Route::post('/{product}/stock', 'store')->name('stock.store');
});
```

### 5. Product/Index.jsx
Import `TbEye` dari `react-icons/tb`. Modifikasi `render` kolom `actions` yang sudah ada —
tambah tombol Detail (Eye) sebagai ikon pertama, sebelum Edit dan Delete:

```jsx
{
    key: "actions",
    label: "Action",
    render: (item, { onDelete }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-3 justify-center"
        >
            <Link href={route("product.show", item.id)}>
                <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
            </Link>
            <Link href={route("product.edit", item.id)}>
                <TbEdit className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
            </Link>
            <TbTrash
                className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                onClick={() => onDelete(item.id)}
            />
        </motion.div>
    ),
},
```

### 6. Product/Create.jsx
Tambah ke `useForm`: `initial_quantity: null, initial_unit_cost: null, initial_note: ''`

Section "Initial Stock" di bawah field utama:
```jsx
<div className="border-t-2 dark:border-slate-700 pt-4 mt-2">
    <p className="font-bold text-lg mb-3">Initial Stock <span className="text-slate-400 text-sm font-normal">(optional)</span></p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NumberInput name="initial_quantity" label="Quantity" ... />
        <NumberInput name="initial_unit_cost" type="currency" label="Unit Cost" ... />
        <TextInput name="initial_note" label="Note" placeholder="e.g. Initial stock" ... />
    </div>
</div>
```

### 7. Product/Edit.jsx
Tambah ke `useForm`: `stock_quantity: null, stock_type: 'in', stock_unit_cost: null, stock_note: ''`

Section "Add Stock Entry" di bawah field utama:
```jsx
<div className="border-t-2 dark:border-slate-700 pt-4 mt-2">
    <p className="font-bold text-lg mb-3">Add Stock Entry <span className="text-slate-400 text-sm font-normal">(optional)</span></p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SelectInput name="stock_type" label="Type" options={stockTypeOptions} ... />
        <NumberInput name="stock_quantity" label="Quantity" ... />
        <NumberInput name="stock_unit_cost" type="currency" label="Unit Cost" ... />
        <TextInput name="stock_note" label="Note" ... />
    </div>
</div>
```

### 8. Product/Show.jsx (baru)
- Redux: `setCurrentRoute({ route: 'product', subRoute: 'detail' })`
- Header: nama produk, badge current stock, tombol Back ke `product.index`, tombol "Add Stock" ke `product.stock.create`
- Card info produk: thumbnail (jika ada), name, price, description
- Tabel stock history menggunakan `@table-library/react-table-library` **secara langsung**
  (bukan `<DataTable>`) — tidak butuh select/delete, tidak perlu pagination (semua entries dimuat
  dari server sekaligus; stock history per produk biasanya sedikit).
  Gunakan `tableStyle()` + `Table`, `Header`, `HeaderCell`, `HeaderRow`, `Body`, `Cell`, `Row`
  dari `@table-library/react-table-library/table`. **Jangan pakai `usePagination` dan
  jangan pakai `PaginationButton`** — API keduanya sudah berubah di Plan 00c.
  - Kolom: Date, Type (badge warna), Quantity, Unit Cost, Note
  - Badge: `in` = emerald, `out` = red, `adjustment` = yellow

### 9. Product/Stock/Create.jsx (baru)
- Redux: `setCurrentRoute({ route: 'product', subRoute: 'stock' })`
- Header: "Add Stock — {product.name}", tombol Back ke `product.show`
- Form fields: SelectInput (type), NumberInput (quantity, required), NumberInput (unit_cost), TextInput (note)
- Submit ke `product.stock.store`

---

## Utilities to Reuse

| Utility | Path |
|---|---|
| `tableStyle()`, `tableRowsSizeOptions()` | `resources/js/config/tableConfig.jsx` |
| `SelectInput` | `resources/js/Components/input/SelectInput.jsx` |
| `NumberInput` | `resources/js/Components/input/NumberInput.jsx` |
| `TextInput` | `resources/js/Components/input/TextInput.jsx` |
| `tableStyle()` (untuk Show.jsx) | `resources/js/config/tableConfig.jsx` — hanya `tableStyle`, tidak pakai `usePagination` |

---

## Verification

1. `php artisan route:list --name=product` → ada `product.show`, `product.stock.create`, `product.stock.store`
2. Create Product + isi Initial Stock → simpan → buka Show → riwayat stock muncul 1 entry
3. Edit Product + isi Add Stock Entry (type: in, qty: 5) → simpan → riwayat bertambah
4. Index → klik icon Eye → masuk halaman Show
5. Show → klik Add Stock → isi form → simpan → kembali ke Show dengan entry baru
6. Stock type `out` → quantity tersimpan negatif di DB, current stock berkurang
7. `vendor/bin/pint --dirty` → tidak ada error
