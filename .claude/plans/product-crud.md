# Plan: Product CRUD

## Context

Frontend Product pages (Index/Create/Edit) masih menggunakan schema inventoryapp-dummy
(supplier_id, product_category_id, image, stock column). Schema zenlab hanya punya
`name, description, price, created_by`. Stock dihitung dari tabel `stocks` (SUM quantity).

Perlu: (1) tulis ulang 3 frontend pages agar sesuai schema, (2) buat backend controller +
form requests + routes, (3) tambah link Products di Sidebar.

Delete single: route `product.destroy` | Bulk delete: route `product.destroySelected` dengan
comma-separated IDs sebagai parameter (sudah hardcoded di ModalDelete.jsx).

---

## Backend

### 1. CREATE `app/Http/Requests/StoreProductRequest.php`

```php
public function rules(): array
{
    return [
        'name'        => ['required', 'string', 'max:255'],
        'price'       => ['required', 'integer', 'min:0'],
        'description' => ['nullable', 'string'],
    ];
}
```

### 2. CREATE `app/Http/Requests/UpdateProductRequest.php`

Sama dengan StoreProductRequest.

### 3. CREATE `app/Http/Controllers/Admin/ProductController.php`

```php
public function index(): Response
{
    $products = Product::query()
        ->withSum('stocks', 'quantity')
        ->latest()
        ->get();

    return Inertia::render('Product/Index', ['products' => $products]);
}

public function create(): Response
{
    return Inertia::render('Product/Create');
}

public function store(StoreProductRequest $request): RedirectResponse
{
    Product::create([...$request->validated(), 'created_by' => auth()->id()]);

    return redirect()->route('product.index')->with('success', 'Product berhasil ditambahkan.');
}

public function edit(Product $product): Response
{
    return Inertia::render('Product/Edit', ['product' => $product]);
}

public function update(UpdateProductRequest $request, Product $product): RedirectResponse
{
    $product->update($request->validated());

    return redirect()->route('product.index')->with('success', 'Product berhasil diperbarui.');
}

public function destroy(Product $product): RedirectResponse
{
    $product->delete();

    return redirect()->route('product.index')->with('success', 'Product berhasil dihapus.');
}

public function destroySelected(string $ids): RedirectResponse
{
    Product::query()->whereIn('id', explode(',', $ids))->delete();

    return redirect()->route('product.index')->with('success', 'Product terpilih berhasil dihapus.');
}
```

### 4. MODIFY `routes/web.php`

Tambahkan ke dalam group `['auth', 'role:admin']`:

```php
Route::prefix('admin')->name('admin.')->group(function () {
    // existing dashboard ...
    Route::get('/product',                  [ProductController::class, 'index'])          ->name('product.index');
    Route::get('/product/create',           [ProductController::class, 'create'])         ->name('product.create');
    Route::post('/product',                 [ProductController::class, 'store'])          ->name('product.store');
    Route::get('/product/{product}/edit',   [ProductController::class, 'edit'])           ->name('product.edit');
    Route::put('/product/{product}',        [ProductController::class, 'update'])         ->name('product.update');
    Route::delete('/product/{product}',     [ProductController::class, 'destroy'])        ->name('product.destroy');
    Route::delete('/product/selected/{ids}',[ProductController::class, 'destroySelected'])->name('product.destroySelected');
});
```

> **Catatan route naming:** Frontend memanggil `route('product.index')` bukan `route('admin.product.index')`.
> Karena itu route name harus `product.*` bukan `admin.product.*`. Pisahkan dari group `name('admin.')`.

---

## Frontend

### 5. REWRITE `resources/js/Pages/Product/Index.jsx`

Props: `flash`, `products` (array dengan field: id, name, price, description, stocks_sum_quantity)

Perubahan dari versi lama:
- Hapus: `filterSuppliers`, `filterCategories`, filter dropdown supplier/category, filter state
- Hapus: kolom image, supplier, category dari tabel
- Tambah: kolom Stock (dari `item.stocks_sum_quantity ?? 0`)
- Table columns (6): checkbox | Name | Price | Stock | Description | Action
- Table style: `"auto 1.5fr 1fr 1fr 2fr 0.5fr"`
- Search: tetap by name
- Price format: `Rp${item.price.toLocaleString('id-ID')}`
- Edit link: `route('product.edit', item.id)`
- Add button: `route('product.create')`
- ModalDelete type: `"product"` dan `"product_selected"` (tidak berubah)

### 6. REWRITE `resources/js/Pages/Product/Create.jsx`

Props: hanya `flash`

Form fields (single column, max-w-2xl):
- `name` — TextInput, required
- `price` — NumberInput type="currency", required
- `description` — TextAreaInput, nullable

Hapus: stock, image, supplier_id, product_category_id, suppliers/categories props
Submit: `post(route('product.store'))`
Reset: clear name/price/description

### 7. REWRITE `resources/js/Pages/Product/Edit.jsx`

Props: `flash`, `product` (object dengan id, name, price, description)

Form fields sama dengan Create, pre-populate dari `product`:
- `data.name = product.name`
- `data.price = product.price`
- `data.description = product.description`

Submit: `put(route('product.update', product.id))`

### 8. MODIFY `resources/js/Layouts/Sidebar.jsx`

Tambah link Products di bagian nav (setelah Dashboard):
```jsx
import { TbBox } from "react-icons/tb";

<a href={route('product.index')}>
    <motion.div className={`... ${currentRoute.route === 'product' ? 'active' : 'inactive'}`}>
        <TbBox className="text-2xl mr-3" />
        <p className="font-bold text-lg">Products</p>
    </motion.div>
</a>
```

Gunakan class active/inactive yang sama dengan Dashboard link.

---

## Verification

```bash
php artisan route:list | grep product
# → harus tampil 7 route: index, create, store, edit, update, destroy, destroySelected

# Browser:
# GET  /admin/product           → tabel kosong, tombol Add Product
# GET  /admin/product/create    → form 3 field (name, price, description)
# POST /admin/product           → redirect ke index, flash success
# GET  /admin/product/1/edit    → form pre-populated
# PUT  /admin/product/1         → redirect ke index, flash success
# DELETE /admin/product/1       → modal confirm, redirect ke index
# DELETE /admin/product/selected/1,2,3 → bulk delete
```

---

## Files

| File | Action |
|---|---|
| `app/Http/Requests/StoreProductRequest.php` | CREATE |
| `app/Http/Requests/UpdateProductRequest.php` | CREATE |
| `app/Http/Controllers/Admin/ProductController.php` | CREATE |
| `routes/web.php` | MODIFY — tambah 7 product routes |
| `resources/js/Pages/Product/Index.jsx` | REWRITE |
| `resources/js/Pages/Product/Create.jsx` | REWRITE |
| `resources/js/Pages/Product/Edit.jsx` | REWRITE |
| `resources/js/Layouts/Sidebar.jsx` | MODIFY — tambah Products link |
