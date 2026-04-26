# Plan 06 — Penawaran Ngampas (Weekly Offers)

## Context

"Ngampas" adalah penawaran harga khusus mingguan yang diajukan sales kepada pelanggan.
Sales membuat penawaran (daftar produk + harga khusus), admin mengelola semua penawaran
yang masuk dan bisa mengkonversinya menjadi pesanan.

Tabel yang sudah ada:
- `offers` — nama, deskripsi, tanggal
- `offers_items` — offer_id, product_id, quantity, offered_price, subtotal
- `offers_sales` — junction: offer_id ↔ sale_id (+ notes)

Bergantung pada **Plan 03** (User/Sales) dan **Plan 04** (Pesanan).

---

## Files to Create

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Admin/OfferController.php` | Index, show, convert to order |
| `app/Http/Controllers/Sales/OfferController.php` | Create, store (sales buat penawaran) |
| `app/Http/Requests/StoreOfferRequest.php` | Validasi form penawaran |
| `resources/js/Pages/Offer/Index.jsx` | Admin — daftar semua penawaran |
| `resources/js/Pages/Offer/Show.jsx` | Admin — detail penawaran + action |
| `resources/js/Pages/Sales/Offer/Create.jsx` | Sales — form buat penawaran |

## Files to Modify

| File | Perubahan |
|---|---|
| `routes/web.php` | Tambah routes offer untuk admin & sales |
| `resources/js/Layouts/Sidebar.jsx` | Tambah link "Penawaran" di nav admin & sales |

---

## Alur Bisnis

```
Sales → Buat Penawaran (pilih produk, qty, harga tawar, pilih customer)
              ↓ tersimpan di offers + offers_items + offers_sales
Admin → Lihat daftar penawaran → buka detail
              ↓ pilih aksi:
         [Setujui → convert ke Order] atau [Tolak]
              ↓ jika disetujui:
         Order baru terbuat dengan items dari offers_items
```

---

## Implementation Steps

### 1. StoreOfferRequest
```php
'name'        => 'required|string|max:255',
'description' => 'nullable|string',
'date'        => 'required|date',
'customer_id' => 'required|exists:customers,id',
'items'       => 'required|array|min:1',
'items.*.product_id'    => 'required|exists:products,id',
'items.*.quantity'      => 'required|integer|min:1',
'items.*.offered_price' => 'required|integer|min:0',
```

### 2. Sales/OfferController — store()
```php
// Buat offer
$offer = Offer::query()->create([
    'name'        => $request->name,
    'description' => $request->description,
    'date'        => $request->date,
    'created_by'  => auth()->id(),
]);

// Buat offer items
foreach ($request->items as $item) {
    $offer->items()->create([
        'product_id'    => $item['product_id'],
        'quantity'      => $item['quantity'],
        'offered_price' => $item['offered_price'],
        'subtotal'      => $item['quantity'] * $item['offered_price'],
        'created_by'    => auth()->id(),
    ]);
}

// Link ke sales rep
$offer->offerSales()->create([
    'sale_id'    => auth()->user()->sale->id,
    'notes'      => $request->notes ?? null,
    'created_by' => auth()->id(),
]);
```

### 3. Admin/OfferController

**index()** — server-side search, sort, pagination (ikuti pola Plan 00c):
```php
public function index(Request $request): Response
{
    $search    = $request->query('search', '');
    $sort      = $request->query('sort', 'created_at');
    $direction = $request->query('direction', 'desc');
    $perPage   = $request->query('per_page', 10);

    $allowedSorts = ['name', 'date', 'created_at'];
    if (! in_array($sort, $allowedSorts, true)) {
        $sort = 'created_at';
    }
    if (! in_array($direction, ['asc', 'desc'], true)) {
        $direction = 'desc';
    }

    $offers = Offer::query()
        ->with(['offerSales.sale.user:id,name', 'creator:id,name'])
        ->withCount('items')
        ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
        ->orderBy($sort, $direction)
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('Offer/Index', [
        'offers'  => $offers,
        'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
    ]);
}
```

**show(Offer $offer):** detail lengkap dengan items + produk:
Offer::query()
    ->with([
        'items.product:id,name,thumbnail',
        'offerSales.sale.user:id,name',
    ])
    ->findOrFail($offer->id)

// convertToOrder(Offer $offer): buat Order dari penawaran
// → buat Order baru (user_id = customer_id dari offer)
// → buat OrderItems dari offers_items
// → set paid_at = null (menunggu pembayaran customer)
DB::transaction(function () use ($offer) {
    $order = Order::query()->create([
        'user_id'     => $offer->customer_id,  // perlu tambah customer_id ke offers
        'total_price' => $offer->items->sum('subtotal'),
        'created_by'  => auth()->id(),
    ]);
    foreach ($offer->items as $item) {
        $order->items()->create([
            'product_id' => $item->product_id,
            'quantity'   => $item->quantity,
            'price'      => $item->offered_price,
            'subtotal'   => $item->subtotal,
            'created_by' => auth()->id(),
        ]);
    }
});
```

> ⚠️ **Catatan:** Perlu tambah `customer_id` ke tabel `offers` via migration baru, atau
> simpan relasi customer di `offers_sales`. Perlu diskusi lebih lanjut saat implementasi.

### 4. Routes

```php
// Admin
Route::controller(Admin\OfferController::class)->prefix('/offer')->name('offer.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{offer}', 'show')->name('show');
    Route::post('/{offer}/convert', 'convertToOrder')->name('convert');
    Route::patch('/{offer}/reject', 'reject')->name('reject');
});

// Sales
Route::middleware(['auth', 'role:admin,sales'])->prefix('sales')->name('sales.')->group(function () {
    Route::controller(Sales\OfferController::class)->prefix('/offer')->name('offer.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
    });
});
```

Also add `creator()` BelongsTo to `app/Models/Offer.php`:
```php
public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Add `use Illuminate\Database\Eloquent\Relations\BelongsTo;` and `use App\Models\User;`.

### 5. Offer/Index.jsx (Admin)
- `<DataTable>` server-side (Plan 00c), `selectable={false}`
- Props wajib: `nodes={offers.data}`, `meta={offers}`, `filters={filters}`, `routeName="offer.index"`
- Grid: `"0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"` (7 user columns: actions, name, sales_rep, items_count, date, created_at, created_by)
- Tidak ada `sortFns` prop — sort via `sortKey` (server-side)
- Tidak ada explicit `headerClassName`/`cellClassName` — DataTable auto-handles edge styling

```jsx
const OfferIndex = ({ flash, offers, filters }) => { ... }

<DataTable
    nodes={offers.data}
    meta={offers}
    filters={filters}
    routeName="offer.index"
    searchPlaceholder="Search by Offer Name"
    gridLayout="0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"
    selectable={false}
    title="Penawaran"
    addHref={null}
    columns={[
    {
        key: "actions",
        label: "Action",
        render: (item) => (
            <Link href={route("offer.show", item.id)}>
                <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
            </Link>
        ),
    },
    {
        key: "name",
        label: "Nama Penawaran",
        sortKey: "name",
        render: (item) => item.name,
    },
    {
        key: "sales_rep",
        label: "Sales Rep",
        render: (item) => item.offer_sales?.[0]?.sale?.user?.name ?? '-',
    },
    {
        key: "items_count",
        label: "Jumlah Item",
        render: (item) => item.items_count,
    },
    {
        key: "date",
        label: "Tanggal Penawaran",
        sortKey: "date",
        render: (item) => new Date(item.date).toLocaleDateString('id-ID'),
    },
    {
        key: "created_at",
        label: "Created At",
        sortKey: "created_at",
        render: (item) => (
            <span className="text-slate-500 dark:text-slate-400 text-sm">
                {new Date(item.created_at).toLocaleDateString('id-ID')}
            </span>
        ),
    },
    {
        key: "created_by",
        label: "Created By",
        render: (item) => (
            <span className="text-slate-500 dark:text-slate-400 text-sm">
                {item.creator?.name ?? '-'}
            </span>
        ),
    },
]}
/>
```

Status penawaran (active/converted/rejected) perlu kolom `status` di tabel `offers` — putuskan saat implementasi.

### 6. Offer/Show.jsx (Admin)
- Info penawaran: nama, tanggal, sales rep, customer target
- Tabel items: Produk, Qty, Harga Tawar, Subtotal
- Total nilai penawaran
- Action buttons (jika status active):
  - "Setujui & Buat Order" → POST ke `offer.convert` → redirect ke `order.show`
  - "Tolak" → PATCH ke `offer.reject`

### 7. Sales/Offer/Create.jsx
- Form: nama penawaran, tanggal, deskripsi, pilih customer
- Dynamic item list (bisa tambah/hapus baris):
  - SelectInput produk, NumberInput qty, NumberInput harga tawar
  - Auto-hitung subtotal per baris
  - Total keseluruhan di bawah
- Submit ke `sales.offer.store`

---

## Utilities to Reuse

- `DataTable` — `resources/js/Components/DataTable.jsx` (Plan 00)
- `ModalConfirm` — `resources/js/Components/modal/ModalConfirm.jsx`
- `SelectInput` — `resources/js/Components/input/SelectInput.jsx`
- `NumberInput` — `resources/js/Components/input/NumberInput.jsx`

---

## Open Questions (perlu keputusan saat implementasi)

1. Apakah `offers` perlu kolom `customer_id`? Atau relasi customer disimpan di `offers_sales`?
2. Apakah perlu kolom `status` di tabel `offers` (active/converted/rejected)?
3. Setelah dikonversi ke order, apakah offer bisa diedit lagi?
4. Apakah sales bisa lihat status penawaran mereka sendiri?

---

## Verification

1. Sales buat penawaran → tersimpan di `offers`, `offers_items`, `offers_sales`
2. Admin lihat daftar penawaran di Offer/Index
3. Admin buka detail → lihat items + sales rep
4. Admin konversi → Order baru terbuat, redirect ke Order/Show
5. Admin tolak → status penawaran berubah
