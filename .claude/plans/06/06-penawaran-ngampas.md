# Plan 06 — Penawaran Ngampas (Weekly Offers)

> **⚠️ Rewrite dari implementasi sebelumnya.** Eksekusi lama harus di-revert
> karena logika bisnis berbeda. Jalankan `php artisan migrate:fresh` setelah
> memperbarui migrations.

## Context

Alur bisnis ngampas yang benar:

1. **Admin buat offer** — daftar produk + qty yang dibawa → **stock OUT langsung**
2. **Sales pergi** kunjungi banyak toko, bawa produk tersebut
3. **Sales catat laporan** per customer yang beli (`offer_records`) — produk apa,
   berapa qty, harga jual aktual berapa
4. **Admin acc/tolak** tiap laporan → acc = Order + Invoice dibuat per customer
   (stock **tidak** dikurangi lagi, sudah dikurangi saat offer dibuat)
5. **Admin tutup offer** → qty tidak terjual (dibawa - total approved) otomatis
   masuk stock IN

Tabel yang sudah ada: `offers`, `offers_items`, `offers_sales`.

---

## Database Changes

> Edit migrations langsung, lalu `php artisan migrate:fresh`.

### A. `offers` — tambah `completed_at`

```php
$table->timestamp('completed_at')->nullable()->after('rejected_at');
```

### B. `offers_records` — baru (laporan penjualan per customer per sales)

```php
Schema::create('offers_records', function (Blueprint $table) {
    $table->id();
    $table->foreignId('offer_id')
          ->constrained('offers')->restrictOnDelete()->restrictOnUpdate();
    $table->foreignId('sale_id')
          ->constrained('sales')->restrictOnDelete()->restrictOnUpdate();
    $table->foreignId('customer_id')->nullable()
          ->constrained('customers')->restrictOnDelete()->restrictOnUpdate();
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->string('notes')->nullable();
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

### C. `offers_record_items` — baru (item dalam tiap laporan)

```php
Schema::create('offers_record_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('offer_record_id')
          ->constrained('offers_records')->restrictOnDelete()->restrictOnUpdate();
    $table->foreignId('product_id')
          ->constrained('products')->restrictOnDelete()->restrictOnUpdate();
    $table->integer('quantity');
    $table->integer('sold_price');
    $table->integer('subtotal');
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

> ⚠️ Urutan: `offers_records` harus sebelum `offers_record_items` (FK dependency).
> Beri timestamp lebih kecil dari `offers_record_items`.

### D. `orders` — tambah `offer_record_id` nullable

```php
$table->foreignId('offer_record_id')->nullable()
      ->constrained('offers_records')->restrictOnDelete()->restrictOnUpdate();
```

> Dipakai di OrderObserver untuk skip stock deduction pada order yang berasal dari offer.

---

## Models

### `Offer.php` — update

```php
protected $fillable = [
    'name', 'description', 'date', 'rejected_at', 'completed_at', 'created_by',
];

protected $appends = ['status'];

protected function casts(): array
{
    return [
        'date'         => 'date',
        'rejected_at'  => 'datetime',
        'completed_at' => 'datetime',
    ];
}

public function getStatusAttribute(): string
{
    if ($this->rejected_at)  { return 'rejected'; }
    if ($this->completed_at) { return 'completed'; }
    return 'active';
}

// tambah relasi:
public function records(): HasMany
{
    return $this->hasMany(OfferRecord::class);
}
```

Relasi `items()`, `offerSales()`, `creator()` tetap sama.

### `OfferRecord.php` — baru

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OfferRecord extends Model
{
    protected $table = 'offers_records';

    protected $fillable = [
        'offer_id', 'sale_id', 'customer_id', 'status', 'notes', 'created_by',
    ];

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OfferRecordItem::class, 'offer_record_id');
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class, 'offer_record_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

### `OfferRecordItem.php` — baru

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfferRecordItem extends Model
{
    protected $table = 'offers_record_items';

    protected $fillable = [
        'offer_record_id', 'product_id', 'quantity', 'sold_price', 'subtotal', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'integer',
            'sold_price' => 'integer',
            'subtotal'   => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function record(): BelongsTo
    {
        return $this->belongsTo(OfferRecord::class, 'offer_record_id');
    }
}
```

### `Order.php` — tambah ke `$fillable`

```php
'offer_record_id',
```

### `OrderObserver.php` — skip stock deduction untuk order dari offer

```php
public function created(Order $order): void
{
    if ($order->checked_out_at === null) { return; }
    if ($order->offer_record_id !== null) { return; } // stock sudah dikurangi saat offer dibuat
    DB::afterCommit(function () use ($order): void {
        $freshOrder = $order->fresh();
        if ($freshOrder === null) { return; }
        $this->deductStock($freshOrder);
    });
}
```

---

## OfferObserver — baru

Deduct stock saat offer dibuat. Daftarkan di `AppServiceProvider::boot()`.

```php
namespace App\Observers;

use App\Models\Offer;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class OfferObserver
{
    public function created(Offer $offer): void
    {
        DB::afterCommit(function () use ($offer): void {
            $fresh = $offer->fresh(['items']);
            if ($fresh === null) { return; }

            foreach ($fresh->items as $item) {
                Stock::query()->create([
                    'product_id'     => $item->product_id,
                    'quantity'       => -$item->quantity,
                    'type'           => 'out',
                    'reference_id'   => $offer->id,
                    'reference_type' => Offer::class,
                    'note'           => "Ngampas: {$offer->name}",
                    'created_by'     => $offer->created_by,
                ]);
            }
        });
    }
}
```

Register di `AppServiceProvider`:
```php
use App\Models\Offer;
use App\Observers\OfferObserver;

Offer::observe(OfferObserver::class);
```

---

## Files to Create / Modify

### Admin

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Admin/OfferController.php` | Rewrite — index, create, store, show, complete, reject, storeRecord, approveRecord, rejectRecord |
| `app/Http/Requests/StoreOfferRequest.php` | Sama seperti sebelumnya |
| `app/Http/Requests/StoreOfferRecordRequest.php` | Baru — validasi laporan (dengan `sale_id`) |
| `app/Models/OfferRecord.php` | Baru |
| `app/Models/OfferRecordItem.php` | Baru |
| `app/Observers/OfferObserver.php` | Baru — stock OUT saat offer dibuat |
| `resources/js/Pages/Offer/Index.jsx` | Sama seperti sebelumnya |
| `resources/js/Pages/Offer/Create.jsx` | Sama seperti sebelumnya |
| `resources/js/Pages/Offer/Show.jsx` | Significant rewrite |

### Sales

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Sales/OfferController.php` | Baru — index, show, storeRecord |
| `app/Http/Requests/StoreSalesOfferRecordRequest.php` | Baru — validasi tanpa `sale_id` |
| `resources/js/Pages/Sales/Offer/Index.jsx` | Baru — list offer yang ditugaskan |
| `resources/js/Pages/Sales/Offer/Show.jsx` | Baru — detail + form laporan (tanpa aksi admin) |

### Shared

| File | Perubahan |
|---|---|
| `routes/web.php` | Tambah 9 admin routes + 3 sales routes |
| `resources/js/Layouts/Sidebar.jsx` | Tambah Offers link untuk `user?.role === 'sales'` |
| `app/Models/Order.php` | Tambah `offer_record_id` ke `$fillable` |
| `app/Observers/OrderObserver.php` | Skip deductStock jika `offer_record_id !== null` |
| `app/Providers/AppServiceProvider.php` | Register `OfferObserver` |

---

## Implementation Steps

### 1. StoreOfferRequest

Sama seperti plan sebelumnya:
```php
'name'                   => ['required', 'string', 'max:255'],
'description'            => ['nullable', 'string'],
'date'                   => ['required', 'date'],
'sale_ids'               => ['required', 'array', 'min:1'],
'sale_ids.*'             => ['required', 'exists:sales,id'],
'items'                  => ['required', 'array', 'min:1'],
'items.*.product_id'    => ['required', 'exists:products,id'],
'items.*.quantity'      => ['required', 'integer', 'min:1'],
'items.*.offered_price' => ['required', 'integer', 'min:0'],
```

### 2. StoreOfferRecordRequest — baru

```php
public function rules(): array
{
    return [
        'sale_id'             => ['required', 'exists:sales,id'],
        'customer_id'         => ['nullable', 'exists:customers,id'],
        'notes'               => ['nullable', 'string', 'max:255'],
        'items'               => ['required', 'array', 'min:1'],
        'items.*.product_id'  => ['required', 'exists:products,id'],
        'items.*.quantity'    => ['required', 'integer', 'min:1'],
        'items.*.sold_price'  => ['required', 'integer', 'min:0'],
    ];
}
```

### 3. OfferController

**`index()`, `create()`, `store()`** — sama seperti implementasi sebelumnya.
`store()` tidak perlu logika stock — sudah ditangani `OfferObserver`.

**`show()`** — tambah eager-load records:

```php
public function show(Offer $offer): Response
{
    $offer->load([
        'items.product:id,name,thumbnail',
        'offerSales.sale.user:id,name',
        'creator:id,name',
        'records.customer:id,name',
        'records.sale.user:id,name',
        'records.items.product:id,name',
    ]);

    return Inertia::render('Offer/Show', [
        'offer'     => $offer,
        'customers' => Customer::query()->select(['id', 'name'])->orderBy('name')->get(),
    ]);
}
```

> `sales` untuk form record diambil dari `offer.offer_sales` — tidak perlu pass terpisah.

**`complete()`** — tutup offer, return unsold stock:

```php
public function complete(Offer $offer): RedirectResponse
{
    if ($offer->completed_at || $offer->rejected_at) {
        return back()->with('error', 'Offer is already finished.');
    }

    DB::transaction(function () use ($offer): void {
        $soldByProduct = OfferRecordItem::query()
            ->whereHas('record', fn ($q) => $q
                ->where('offer_id', $offer->id)
                ->where('status', 'approved'))
            ->selectRaw('product_id, SUM(quantity) as sold_qty')
            ->groupBy('product_id')
            ->pluck('sold_qty', 'product_id');

        foreach ($offer->load('items')->items as $item) {
            $sold   = (int) ($soldByProduct[$item->product_id] ?? 0);
            $unsold = $item->quantity - $sold;
            if ($unsold > 0) {
                Stock::query()->create([
                    'product_id'     => $item->product_id,
                    'quantity'       => $unsold,
                    'type'           => 'in',
                    'reference_id'   => $offer->id,
                    'reference_type' => Offer::class,
                    'note'           => "Retur ngampas: {$offer->name}",
                    'created_by'     => auth()->id(),
                ]);
            }
        }

        $offer->update(['completed_at' => now()]);
    });

    return back()->with('success', 'Offer completed. Unsold stock returned.');
}
```

**`reject()`** — reject offer, return SEMUA stock (belum ada yang terjual):

```php
public function reject(Offer $offer): RedirectResponse
{
    if ($offer->rejected_at || $offer->completed_at) {
        return back()->with('error', 'Offer is already finished.');
    }

    DB::transaction(function () use ($offer): void {
        foreach ($offer->load('items')->items as $item) {
            Stock::query()->create([
                'product_id'     => $item->product_id,
                'quantity'       => $item->quantity,
                'type'           => 'in',
                'reference_id'   => $offer->id,
                'reference_type' => Offer::class,
                'note'           => "Batal ngampas: {$offer->name}",
                'created_by'     => auth()->id(),
            ]);
        }

        $offer->update(['rejected_at' => now()]);
    });

    return back()->with('success', 'Offer rejected. All stock returned.');
}
```

**`storeRecord()`** — sales buat laporan per customer:

```php
public function storeRecord(StoreOfferRecordRequest $request, Offer $offer): RedirectResponse
{
    if ($offer->completed_at || $offer->rejected_at) {
        return back()->with('error', 'Cannot add record to a finished offer.');
    }

    DB::transaction(function () use ($request, $offer): void {
        $validated = $request->validated();

        $record = OfferRecord::query()->create([
            'offer_id'    => $offer->id,
            'sale_id'     => $validated['sale_id'],
            'customer_id' => $validated['customer_id'] ?? null,
            'notes'       => $validated['notes'] ?? null,
            'status'      => 'pending',
            'created_by'  => auth()->id(),
        ]);

        foreach ($validated['items'] as $item) {
            $record->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'sold_price' => $item['sold_price'],
                'subtotal'   => $item['quantity'] * $item['sold_price'],
                'created_by' => auth()->id(),
            ]);
        }
    });

    return back()->with('success', 'Sale record added.');
}
```

**`approveRecord()`** — admin acc → Order + Invoice, TANPA stock deduction:

```php
public function approveRecord(Offer $offer, OfferRecord $record): RedirectResponse
{
    if ($record->offer_id !== $offer->id) {
        abort(404);
    }
    if ($record->status !== 'pending') {
        return back()->with('error', 'Record is already processed.');
    }

    $order = DB::transaction(function () use ($record): Order {
        $record->load('items');
        $totalPrice = $record->items->sum('subtotal');

        $order = Order::withoutObservers(function () use ($record, $totalPrice): Order {
            return Order::query()->create([
                'customer_id'     => $record->customer_id,
                'offer_record_id' => $record->id,
                'total_price'     => $totalPrice,
                'checked_out_at'  => now(),
                'created_by'      => auth()->id(),
            ]);
        });

        foreach ($record->items as $item) {
            $order->items()->create([
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->sold_price,
                'subtotal'   => $item->subtotal,
                'created_by' => auth()->id(),
            ]);
        }

        $order->invoice()->create([
            'total_amount' => $totalPrice,
            'created_by'   => auth()->id(),
        ]);

        $record->update(['status' => 'approved']);

        return $order;
    });

    return redirect()->route('order.show', $order)
        ->with('success', 'Record approved. Order and invoice created.');
}
```

**`rejectRecord()`**:

```php
public function rejectRecord(Offer $offer, OfferRecord $record): RedirectResponse
{
    if ($record->offer_id !== $offer->id) {
        abort(404);
    }
    if ($record->status !== 'pending') {
        return back()->with('error', 'Record is already processed.');
    }

    $record->update(['status' => 'rejected']);

    return back()->with('success', 'Record rejected.');
}
```

**Imports yang dibutuhkan** (tambah dari sebelumnya):

```php
use App\Http\Requests\StoreOfferRecordRequest;
use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\Order;
use App\Models\Stock;
```

### 4. Routes

```php
Route::controller(OfferController::class)->prefix('/offer')->name('offer.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{offer}', 'show')->name('show');
    Route::patch('/{offer}/complete', 'complete')->name('complete');
    Route::patch('/{offer}/reject', 'reject')->name('reject');
    Route::post('/{offer}/record', 'storeRecord')->name('record.store');
    Route::post('/{offer}/record/{record}/approve', 'approveRecord')->name('record.approve');
    Route::patch('/{offer}/record/{record}/reject', 'rejectRecord')->name('record.reject');
});
```

### 5. Offer/Index.jsx

Sama seperti implementasi sebelumnya — tidak ada perubahan.

### 6. Offer/Create.jsx

Sama seperti implementasi sebelumnya — tidak ada perubahan.

### 7. Offer/Show.jsx — Rewrite

Struktur halaman (4 section):

**Section 1 — Info Offer** (sama seperti sebelumnya: nama, tanggal, deskripsi, sales, status badge)

**Section 2 — Items Dibawa** (table-library):
- Kolom: Thumbnail, Nama Produk, Qty Dibawa, Harga Target (`offered_price`)
- `tableStyle("auto 1.5fr 0.5fr 1fr", "offer-items-table")`
- Total di bawah tabel

**Section 3 — Sale Records** (table-library atau plain HTML):

```jsx
// statusRecordClassMap (module level)
const statusRecordClassMap = {
    pending:  'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
};

// tiap record:
// Customer | Sales | Total | Status | Actions
// customer?.name ?? italic Walk-in
// record.sale?.user?.name
// record.items.reduce(sum subtotal)
// status badge
// jika pending: tombol Acc + Tolak (hanya jika offer.status === 'active')
```

Tombol Acc → `router.post(route('offer.record.approve', [offer.id, record.id]))`
Tombol Tolak → `router.patch(route('offer.record.reject', [offer.id, record.id]))` + `window.confirm`

**Section 4 — Add Record Form** (hanya jika `offer.status === 'active'`):

```jsx
// toggle dengan button "Tambah Laporan Penjualan"
// useForm({ sale_id: null, customer_id: null, notes: '', items: [] })
// post(route('offer.record.store', offer.id))

// Form fields:
// SelectInput sale_id — dari offer.offer_sales (hanya sales yang assigned ke offer ini)
//   options: offer.offer_sales.map(os => ({ value: os.sale_id, label: os.sale?.user?.name }))
// SelectInput customer_id — nullable, dari prop customers
// TextAreaInput notes — opsional
// Dynamic items:
//   SelectInput product_id — dari offer.items (produk yang dibawa di offer ini)
//     options: offer.items.map(oi => ({ value: oi.product_id, label: oi.product?.name }))
//   NumberInput quantity (min 1)
//   NumberInput sold_price (min 0)
//   Subtotal read-only
// Total record di bawah
```

**Action Buttons** (hanya jika `offer.status === 'active'`, di bawah semua section):

```jsx
<button onClick={handleComplete}>Selesaikan Offer</button>  // PATCH offer.complete
<button onClick={handleReject}>Batalkan Offer</button>      // PATCH offer.reject
```

Kedua aksi perlu `window.confirm` — selesaikan akan return unsold stock, batalkan akan return semua stock.

### 8. Sidebar

Tidak ada perubahan dari implementasi sebelumnya.

---

## Sales Role

Sales memiliki akses terbatas: hanya bisa melihat offer yang ditugaskan kepadanya
dan menambahkan laporan penjualan. Tidak bisa approve/reject record, complete/reject
offer, atau membuat offer baru.

Infrastruktur yang sudah ada: route group `middleware(['auth', 'role:admin,sales'])`
prefix `/sales` name `sales.*` (lihat `routes/web.php`). Sidebar sudah cek
`user?.role === "admin"` secara kondisional.

### Files to Create (Sales)

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Sales/OfferController.php` | index, show, storeRecord |
| `app/Http/Requests/StoreSalesOfferRecordRequest.php` | Validasi tanpa `sale_id` (auto dari auth) |
| `resources/js/Pages/Sales/Offer/Index.jsx` | List offer yang ditugaskan ke sales ini |
| `resources/js/Pages/Sales/Offer/Show.jsx` | Detail offer + form tambah laporan |

### Files to Modify (Sales)

| File | Perubahan |
|---|---|
| `routes/web.php` | Tambah offer routes ke group `role:admin,sales` |
| `resources/js/Layouts/Sidebar.jsx` | Tambah link Offers untuk `user?.role === 'sales'` |

---

### 9. StoreSalesOfferRecordRequest

Sama seperti `StoreOfferRecordRequest` tapi **tanpa `sale_id`** — diisi otomatis dari auth:

```php
public function rules(): array
{
    return [
        'customer_id'         => ['nullable', 'exists:customers,id'],
        'notes'               => ['nullable', 'string', 'max:255'],
        'items'               => ['required', 'array', 'min:1'],
        'items.*.product_id'  => ['required', 'exists:products,id'],
        'items.*.quantity'    => ['required', 'integer', 'min:1'],
        'items.*.sold_price'  => ['required', 'integer', 'min:0'],
    ];
}
```

### 10. Sales/OfferController

```php
namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesOfferRecordRequest;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferRecord;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    private function currentSale(): Sale
    {
        return Sale::query()->where('user_id', auth()->id())->firstOrFail();
    }

    public function index(Request $request): Response
    {
        $sale      = $this->currentSale();
        $search    = $request->query('search', '');
        $sort      = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage   = $request->query('per_page', 10);

        $allowedSorts = ['name', 'date', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) { $sort = 'created_at'; }
        if (! in_array($direction, ['asc', 'desc'], true)) { $direction = 'desc'; }

        $offers = Offer::query()
            ->select(['id', 'name', 'date', 'rejected_at', 'completed_at', 'created_at', 'created_by'])
            ->whereHas('offerSales', fn ($q) => $q->where('sale_id', $sale->id))
            ->withCount('items')
            ->with(['creator:id,name'])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Sales/Offer/Index', [
            'offers'  => $offers,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function show(Offer $offer): Response
    {
        $sale = $this->currentSale();

        if (! $offer->offerSales()->where('sale_id', $sale->id)->exists()) {
            abort(403);
        }

        $offer->load([
            'items.product:id,name,thumbnail',
            'offerSales.sale.user:id,name',
            'creator:id,name',
            'records.customer:id,name',
            'records.sale.user:id,name',
            'records.items.product:id,name',
        ]);

        return Inertia::render('Sales/Offer/Show', [
            'offer'         => $offer,
            'customers'     => Customer::query()->select(['id', 'name'])->orderBy('name')->get(),
            'currentSaleId' => $sale->id,
        ]);
    }

    public function storeRecord(StoreSalesOfferRecordRequest $request, Offer $offer): RedirectResponse
    {
        $sale = $this->currentSale();

        if (! $offer->offerSales()->where('sale_id', $sale->id)->exists()) {
            abort(403);
        }

        if ($offer->completed_at || $offer->rejected_at) {
            return back()->with('error', 'Cannot add record to a finished offer.');
        }

        DB::transaction(function () use ($request, $offer, $sale): void {
            $validated = $request->validated();

            $record = OfferRecord::query()->create([
                'offer_id'    => $offer->id,
                'sale_id'     => $sale->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'notes'       => $validated['notes'] ?? null,
                'status'      => 'pending',
                'created_by'  => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $record->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'sold_price' => $item['sold_price'],
                    'subtotal'   => $item['quantity'] * $item['sold_price'],
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Laporan penjualan berhasil dikirim.');
    }
}
```

### 11. Routes — tambah ke group `role:admin,sales`

```php
// Tambahkan import di atas:
use App\Http\Controllers\Sales\OfferController as SalesOfferController;

// Di dalam group middleware(['auth', 'role:admin,sales']) prefix('sales') name('sales.'):
Route::controller(SalesOfferController::class)->prefix('/offer')->name('offer.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{offer}', 'show')->name('show');
    Route::post('/{offer}/record', 'storeRecord')->name('record.store');
});
```

Route names yang dihasilkan: `sales.offer.index`, `sales.offer.show`, `sales.offer.record.store`.

### 12. Sales/Offer/Index.jsx

- `setCurrentRoute({ route: 'offer', subRoute: null })`
- `routeName="sales.offer.index"`
- Tidak ada tombol "Buat Offer" (`addHref` tidak diisi)
- Grid: `"0.5fr 1.5fr 0.8fr 0.8fr 1fr 1fr 0.8fr"` (7 kolom)

```jsx
columns={[
    {
        key: "actions",
        label: "Action",
        render: (item) => (
            <div className="flex justify-center">
                <Link href={route("sales.offer.show", item.id)}>
                    <TbEye className="text-3xl text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-all" />
                </Link>
            </div>
        ),
    },
    { key: "name", label: "Nama Penawaran", sortKey: "name", render: (item) => item.name },
    {
        key: "status",
        label: "Status",
        render: (item) => (
            <span className={`px-2 py-1 rounded-lg text-sm font-bold capitalize ${statusClassMap[item.status]}`}>
                {item.status}
            </span>
        ),
    },
    { key: "items_count", label: "Jumlah Item", render: (item) => item.items_count ?? 0 },
    {
        key: "date",
        label: "Tgl Penawaran",
        sortKey: "date",
        render: (item) => new Date(item.date).toLocaleDateString("id-ID"),
    },
    {
        key: "created_at",
        label: "Created At",
        sortKey: "created_at",
        render: (item) => (
            <span className="text-slate-500 dark:text-slate-400 text-sm">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
            </span>
        ),
    },
    {
        key: "created_by",
        label: "Created By",
        render: (item) => (
            <span className="text-slate-500 dark:text-slate-400 text-sm">
                {item.creator?.name ?? "-"}
            </span>
        ),
    },
]}
```

### 13. Sales/Offer/Show.jsx

Mirip dengan admin `Offer/Show.jsx` tapi dengan batasan:
- **Tidak ada** tombol Acc/Tolak pada records
- **Tidak ada** tombol Selesaikan/Batalkan offer
- Form tambah laporan **tidak punya field `sale_id`** (otomatis = user saat ini)
- Records milik sales ini ditandai secara visual

Struktur (3 section):

**Section 1 — Info Offer** — sama persis dengan admin Show

**Section 2 — Items Dibawa** — sama persis dengan admin Show

**Section 3 — Sale Records + Add Record Form**:

```jsx
// prop: currentSaleId — untuk highlight record milik sales ini

// Tiap record tampilkan:
// Customer | Sales | Total | Status
// Record milik sendiri: border atau highlight berbeda (mis. border-sky-200)
// Tidak ada tombol Acc/Tolak

// Add Record Form (toggle, hanya jika offer.status === 'active'):
// useForm({ customer_id: null, notes: '', items: [] })
// post(route('sales.offer.record.store', offer.id))
//
// SelectInput customer_id (nullable)
// TextAreaInput notes (opsional)
// Dynamic items:
//   SelectInput product_id — dari offer.items saja
//     options: offer.items.map(oi => ({ value: oi.product_id, label: oi.product?.name }))
//   NumberInput quantity (min 1)
//   NumberInput sold_price (min 0) — tampilkan offered_price sebagai hint
//   Subtotal read-only
// Total record di bawah
// Submit "Kirim Laporan"
```

### 14. Sidebar — tambah link untuk sales

```jsx
// Tambah setelah blok {user?.role === "admin" && <Link Offers...>}:
{user?.role === "sales" && (
    <Link href={route("sales.offer.index")}>
        <motion.div
            className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                currentRoute.route === "offer"
                    ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
        >
            <TbFileText className="text-2xl mr-3" />
            <p className="font-bold text-lg">Offers</p>
        </motion.div>
    </Link>
)}
```

---

## Catatan Penting

### `Order::withoutObservers()` untuk approve

`approveRecord()` membuat order menggunakan `Order::withoutObservers()` agar
`OrderObserver::created()` tidak dijalankan. Stock sudah dikurangi saat offer dibuat —
mengurangi lagi akan double-deduct.

Alternatif jika `withoutObservers` tidak tersedia (Laravel version issue):
periksa `offer_record_id !== null` di dalam observer (sudah di-handle di plan ini).

### `offered_price` di offers_items = harga target/acuan

Bukan harga jual aktual. Harga jual aktual ada di `offers_record_items.sold_price`.
`offered_price` digunakan sebagai referensi admin saat menyusun penawaran.

### Stock di-deduct saat offer dibuat, bukan saat record di-approve

Ini berarti jika admin cancel offer (reject) setelah offer dibuat, semua stock harus
dikembalikan secara manual (sudah di-handle di `reject()`).

---

## Verification

### Admin Flow
1. `php artisan migrate:fresh` → tidak ada error
2. `php artisan route:list --name=offer` → 12 routes muncul (9 admin + 3 sales)
3. Admin buat offer (Produk A 50 pcs, Produk B 30 pcs), assign Sales X dan Sales Y
   → stock Produk A berkurang 50, Produk B berkurang 30 (via OfferObserver)
4. Admin/Offer/Show: section "Sale Records" kosong, form "Tambah Laporan" tersedia
5. Admin tambah laporan: pilih Sales X → Toko Maju → Produk A 20 pcs @ Rp10.000
   → record status "pending"
6. Admin acc record Toko Maju → redirect ke Order/Show, invoice "unpaid"
   → **cek stock**: Produk A tidak berkurang lagi (tetap -50 dari step 3)
7. Admin selesaikan offer setelah semua record di-acc:
   → Produk A unsold = 50 - 20 = 30 → stock +30
   → Produk B unsold = 30 - 0 = 30 → stock +30
   → offer status "completed", semua tombol hilang
8. Test batalkan offer baru:
   → semua stock dikembalikan penuh, status "rejected"

### Sales Flow
9. Login sebagai user dengan role "sales" yang merupakan Sales X
   → Sidebar menampilkan menu "Offers" (link ke `sales.offer.index`)
   → Sidebar **tidak** menampilkan Orders, Users (admin only)
10. Sales/Offer/Index: hanya tampil offer yang di-assign ke Sales X
    → offer yang tidak di-assign ke Sales X tidak muncul
11. Buka Sales/Offer/Show:
    → tidak ada tombol Acc/Tolak pada records
    → tidak ada tombol Selesaikan/Batalkan offer
    → form "Tambah Laporan" tersedia (tanpa field Sales — otomatis)
12. Sales tambah laporan: Toko Sejuk → Produk A 15 pcs @ Rp9.500
    → record tampil dengan status "pending"
    → record ini terlihat oleh admin di Admin/Offer/Show
13. Coba akses offer yang tidak di-assign ke Sales X via URL langsung
    → 403 Forbidden
14. Admin acc record dari Sales di Admin/Offer/Show → Order + Invoice terbuat
