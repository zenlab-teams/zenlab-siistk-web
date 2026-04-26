# Plan 04 — Mengelola Pesanan

## Context

Admin mengelola semua pesanan yang masuk (dari sales maupun pelanggan langsung). Status order
ditentukan via timestamps bukan enum: `checked_out_at` (lunas), `cancelled_at` (dibatal),
`expired_at` (kedaluwarsa), `paid_at` (sudah bayar, menunggu konfirmasi admin).

Tabel: `orders` (header), `orders_items` (detail produk), `payments` (bukti bayar).

Bergantung pada **Plan 00** (DataTable component).

---

## Files to Create

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Admin/OrderController.php` | Index, show, konfirmasi, cancel |
| `resources/js/Pages/Order/Show.jsx` | Detail pesanan + items + payment + action buttons |

## Files to Modify

| File | Perubahan |
|---|---|
| `app/Http/Controllers/Admin/OrderController.php` | Tulis ulang — saat ini placeholder |
| `resources/js/Pages/Order/Index.jsx` | Refactor ke DataTable + data nyata |
| `routes/web.php` | Tambah routes order |
| `resources/js/Layouts/Sidebar.jsx` | Tambah link "Orders" |

---

## Status Logic

Status dihitung dari timestamps (tidak ada kolom `status`):

```php
// Di model Order atau controller:
public function getStatusAttribute(): string
{
    if ($this->cancelled_at)    { return 'cancelled'; }
    if ($this->checked_out_at)  { return 'completed'; }
    if ($this->paid_at)         { return 'paid'; }      // menunggu konfirmasi
    if ($this->expired_at)      { return 'expired'; }
    return 'pending';
}
```

Badge warna: pending=slate, paid=sky, completed=emerald, cancelled=red, expired=orange.

---

## Implementation Steps

### 1. Order model — status accessor

Tambah accessor `status` ke `app/Models/Order.php` agar terserialisasi otomatis oleh paginator:

```php
protected $appends = ['status'];

public function getStatusAttribute(): string
{
    if ($this->cancelled_at)   { return 'cancelled'; }
    if ($this->checked_out_at) { return 'completed'; }
    if ($this->paid_at)        { return 'paid'; }
    if ($this->expired_at)     { return 'expired'; }
    return 'pending';
}
```

Dengan `$appends`, setiap serialisasi Order (termasuk paginator) otomatis menyertakan `status`.

### 2. OrderController

**index()** — server-side search, sort, pagination (ikuti pola Plan 00c):
```php
public function index(Request $request): Response
{
    $search    = $request->query('search', '');
    $sort      = $request->query('sort', 'created_at');
    $direction = $request->query('direction', 'desc');
    $perPage   = $request->query('per_page', 10);

    $allowedSorts = ['created_at', 'total_price'];
    if (! in_array($sort, $allowedSorts, true)) {
        $sort = 'created_at';
    }
    if (! in_array($direction, ['asc', 'desc'], true)) {
        $direction = 'desc';
    }

    $orders = Order::query()
        ->with(['user:id,name', 'creator:id,name'])
        ->withCount('items')
        ->when($search, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")))
        ->orderBy($sort, $direction)
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('Order/Index', [
        'orders'  => $orders,
        'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
    ]);
}
```

**show(Order $order):** detail lengkap:
```php
Order::query()
    ->with([
        'user:id,name,email',
        'items.product:id,name,thumbnail',
        'payment',
    ])
    ->findOrFail($order->id)
```

**confirmPayment(Order $order):** set `checked_out_at = now()`.
OrderObserver sudah terdaftar di AppServiceProvider — stock dikurangi otomatis.

**cancel(Order $order):** set `cancelled_at = now()`.

### 3. Routes
```php
Route::controller(OrderController::class)->prefix('/order')->name('order.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{order}', 'show')->name('show');
    Route::patch('/{order}/confirm', 'confirmPayment')->name('confirm');
    Route::patch('/{order}/cancel', 'cancel')->name('cancel');
});
```

Also add `creator()` BelongsTo to `app/Models/Order.php`:
```php
public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Add `use Illuminate\Database\Eloquent\Relations\BelongsTo;` if not present.

### 4. Order/Index.jsx
- Gunakan `<DataTable>` server-side (Plan 00c), `selectable={false}`
- Grid: `"0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"` (7 user columns: actions, customer, items_count, total_price, status, created_at, created_by)
- Props wajib: `nodes={orders.data}`, `meta={orders}`, `filters={filters}`, `routeName="order.index"`
- `addHref={null}` — tidak ada tombol Add Order di sini
- `status` sudah tersedia via model accessor `$appends` — tidak perlu mapping manual
- Tidak ada explicit `headerClassName`/`cellClassName` — DataTable auto-handles edge styling

```jsx
const OrderIndex = ({ flash, orders, filters }) => { ... }

<DataTable
    nodes={orders.data}
    meta={orders}
    filters={filters}
    routeName="order.index"
    searchPlaceholder="Search by Customer Name"
    gridLayout="0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"
    selectable={false}
    title="Orders"
    addHref={null}
    columns={[
    {
        key: "actions",
        label: "Action",
        render: (item) => (
            <Link href={route("order.show", item.id)}>
                <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
            </Link>
        ),
    },
    {
        key: "customer",
        label: "Customer",
        render: (item) => item.user?.name ?? '-',
    },
    {
        key: "items_count",
        label: "Total Items",
        render: (item) => item.items_count,
    },
    {
        key: "total_price",
        label: "Total Price",
        sortKey: "total_price",
        render: (item) => `Rp${item.total_price.toLocaleString('id-ID')}`,
    },
    {
        key: "status",
        label: "Status",
        render: (item) => {
            const map = {
                completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                paid:      'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
                pending:   'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                cancelled: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
                expired:   'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
            };
            return <span className={`px-2 py-1 rounded-lg text-sm font-bold ${map[item.status]}`}>{item.status}</span>;
        },
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

### 5. Order/Show.jsx
Layout 2 bagian:

**Kiri — Info Pesanan:**
- Customer name, email
- Status badge (besar)
- Tanggal order, tanggal bayar, tanggal konfirmasi
- Total harga

**Kanan — Bukti Bayar:**
- Gambar `payment.proof_image` (jika ada)
- Amount yang dibayar

**Tabel Items:**
- Kolom: Thumbnail, Nama Produk, Qty, Harga Satuan, Subtotal
- No pagination (biasanya sedikit item)

**Action Buttons** (conditional berdasarkan status):
- Status `paid` → tombol "Konfirmasi Pembayaran" (patch ke `order.confirm`) + "Tolak/Cancel"
- Status `pending` → tombol "Cancel"
- Status `completed/cancelled/expired` → tidak ada action

### 6. Sidebar
Tambah link "Orders" dengan icon `TbShoppingCart` di bawah Products.

---

## Catatan Penting

- `OrderObserver` sudah terdaftar di `AppServiceProvider` — auto stock-out saat `checked_out_at` di-set
- Konfirmasi pembayaran = set `checked_out_at`, bukan hanya `paid_at`
- Admin bisa lihat semua order tanpa filter role

---

## Utilities to Reuse

- `DataTable` — `resources/js/Components/DataTable.jsx` (Plan 00)
- `ModalConfirm` — `resources/js/Components/modal/ModalConfirm.jsx` (untuk confirm/cancel action)
- `tableStyle()` — `resources/js/config/tableConfig.jsx` (untuk tabel items di Show)

---

## Verification

1. `php artisan route:list --name=order` → routes muncul
2. Order/Index menampilkan data order dengan status badge yang benar
3. Klik detail → Show page dengan item list dan bukti bayar
4. Konfirmasi pembayaran → status berubah ke completed, stok berkurang
5. Cancel → status berubah ke cancelled
6. Order yang sudah completed/cancelled tidak bisa diaksi lagi
