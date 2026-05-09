# Plan 01 — Thumbnail Produk

## Context

Tambahkan kolom `thumbnail` ke produk: upload gambar saat Create/Edit, tampil sebagai preview
kecil di halaman Index. User akan jalankan `migrate:fresh`, jadi edit migration langsung.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `database/migrations/2026_04_18_162428_create_products_table.php` | Tambah `thumbnail string nullable` setelah kolom `description` |
| `app/Models/Product.php` | Tambah `thumbnail` ke `$fillable` |
| `app/Http/Requests/StoreProductRequest.php` | Tambah rule `thumbnail: nullable\|image\|mimes:jpeg,jpg,png\|max:2048` |
| `app/Http/Requests/UpdateProductRequest.php` | Sama seperti Store |
| `app/Http/Controllers/Admin/ProductController.php` | Handle upload di `store()` & `update()`; tambah `thumbnail` di `index()` select |
| `resources/js/Pages/Product/Index.jsx` | Tambah kolom Thumbnail, update grid template |
| `resources/js/Pages/Product/Create.jsx` | Tambah `thumbnail: null` ke form, tambah `ImageInput` |
| `resources/js/Pages/Product/Edit.jsx` | Tambah `thumbnail: 'old'` + `_method: 'PUT'`, ganti `put` → `post`, tambah `ImageInput` |

---

## Implementation Steps

### 1. Migration — edit langsung
```php
$table->string('name');
$table->string('description')->nullable();
$table->string('thumbnail')->nullable()->after('description'); // tambah ini
$table->integer('price');
```

### 2. Product model
```php
protected $fillable = [
    'name', 'description', 'thumbnail', 'price', 'created_by',
];
```

### 3. Form Requests (Store & Update)
```php
'thumbnail' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
```

### 4. ProductController

**store():**
```php
$data = $request->safe()->except(['thumbnail']);
$data['created_by'] = auth()->id();
if ($request->hasFile('thumbnail')) {
    $data['thumbnail'] = $request->file('thumbnail')->store('productImages', 'public');
}
Product::query()->create($data);
```

**update():**
```php
$data = $request->safe()->except(['thumbnail']);
if ($request->hasFile('thumbnail')) {
    if ($product->thumbnail) {
        Storage::disk('public')->delete($product->thumbnail);
    }
    $data['thumbnail'] = $request->file('thumbnail')->store('productImages', 'public');
}
$product->update($data);
```

**index():** tambah `'thumbnail'` ke dalam array `->select([...])` yang sudah ada.
Index sudah pakai server-side pagination (Plan 00c) — cukup sisipkan `'thumbnail'`:
```php
->select(['id', 'name', 'description', 'thumbnail', 'price'])
```

Tambah `use Illuminate\Support\Facades\Storage;`

### 5. Product/Index.jsx
- Grid: `"auto 0.5fr 1.5fr 1fr 1fr 2fr 1fr 1fr"` (8 user columns: actions, thumbnail, name, price, stock, description, created_at, created_by)
- Import `TbPhoto` dari `react-icons/tb`
- Tambah kolom `thumbnail` sebagai kolom kedua (setelah `actions`, sebelum `name`):
```jsx
{
    key: "thumbnail",
    label: "Thumbnail",
    render: (item) => (
        item.thumbnail
            ? <img src={'/storage/' + item.thumbnail} className="w-10 h-10 object-cover rounded-lg" />
            : <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <TbPhoto className="text-slate-400" />
              </div>
    ),
},
```
DataTable menangani `<Cell>` dan `<HeaderCell>` secara internal — tidak perlu import keduanya.

### 6. Product/Create.jsx
- Tambah `thumbnail: null` ke `useForm`
- Layout 2 kolom (`grid grid-cols-1 md:grid-cols-2 gap-5`):
  - Kiri: `ImageInput` untuk thumbnail
  - Kanan: TextInput (name), NumberInput (price), TextAreaInput (description)
- Form tetap pakai `post`

### 7. Product/Edit.jsx
- Tambah ke `useForm`: `thumbnail: 'old'`, `_method: 'PUT'`
- Ganti `put` → `post` dari `useForm`
- Panggil `post(route('product.update', product.id))`
- Layout 2 kolom, kiri `ImageInput` dengan props:
  ```jsx
  <ImageInput
      name="thumbnail"
      label="Thumbnail"
      edit={product.thumbnail ? '/storage/' + product.thumbnail : null}
      value={data.thumbnail}
      onChange={setData}
  />
  ```

---

## Utilities to Reuse

- `ImageInput` — `resources/js/Components/input/ImageInput.jsx` (support `edit` prop untuk existing image)

---

## Verification

1. `php artisan migrate:fresh` → kolom `thumbnail` ada di tabel `products`
2. Create Product → upload gambar → simpan → thumbnail muncul di Index
3. Edit Product → gambar lama tampil di preview → ganti gambar → simpan → gambar baru tampil
4. Edit Product → tidak ganti gambar → simpan → gambar lama tetap tersimpan
5. `vendor/bin/pint --dirty` → tidak ada error
