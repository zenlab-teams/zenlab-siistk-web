# Plan 04 — Mengelola Pesanan (Rewrite)

## Context

Admin bertindak sebagai kasir — membuat order langsung. Walk-in customer (tanpa akun)
didukung via `customer_id` nullable. Pembayaran dipisah ke tabel `invoices` + `payments`
untuk mendukung DP/cicilan. Status order via timestamps, bukan enum.

**Bergantung pada Plan 00-03.** Plan 05 dan 06 bergantung pada plan ini.

---

## Prerequisite: Migration & Model Changes

Ini harus dieksekusi **PERTAMA**, sebelum controller/view.
User jalankan `php artisan migrate:fresh` setelah semua migration diedit.

---

### A. Migrations

#### 1. Rename + edit `customers` migration

**Rename file:**
```
database/migrations/2026_04_18_165435_create_customers_table.php
→ database/migrations/2026_04_18_162000_create_customers_table.php
```
(Timestamp harus lebih kecil dari orders `162443` karena orders FK ke customers)

**Isi baru:**
```php
Schema::create('customers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()
        ->constrained('users')->restrictOnDelete()->restrictOnUpdate();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('address');
    $table->string('city');
    $table->string('postal_code');
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

#### 2. Edit `orders` migration (`2026_04_18_162443_create_orders_table.php`)

Ganti `user_id` → `customer_id` nullable, hapus `paid_at`:
```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->nullable()
        ->constrained('customers')->restrictOnDelete()->restrictOnUpdate();
    $table->integer('total_price');
    $table->timestamp('checked_out_at')->nullable();
    $table->timestamp('cancelled_at')->nullable();
    $table->timestamp('expired_at')->nullable();
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

#### 3. Buat migration baru `invoices`

**File baru:** `database/migrations/2026_04_18_163400_create_invoices_table.php`
(Timestamp `163400` — sebelum payments `163533`)
```php
Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')
        ->constrained('orders')->restrictOnDelete()->restrictOnUpdate();
    $table->integer('total_amount');
    $table->date('due_date')->nullable();
    $table->string('notes')->nullable();
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

#### 4. Edit `payments` migration (`2026_04_18_163533_create_payments_table.php`)

Ganti `order_id` → `invoice_id`, tambah `type` dan `note`, buat `proof_image` nullable:
```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('invoice_id')
        ->constrained('invoices')->restrictOnDelete()->restrictOnUpdate();
    $table->integer('amount');
    $table->enum('type', ['dp', 'installment', 'full']);
    $table->string('proof_image')->nullable();
    $table->string('note')->nullable();
    $table->integer('created_by')->nullable();
    $table->timestamps();
});
```

#### 5. Edit `offers` migration (`2026_04_18_163152_create_offers_table.php`)

Tambah `rejected_at` sebelum `created_by`:
```php
$table->timestamp('rejected_at')->nullable();
$table->integer('created_by')->nullable();
```

---

### B. Models

#### `app/Models/Customer.php` — update fillable + relasi
```php
protected $fillable = [
    'user_id', 'name', 'phone', 'email',
    'address', 'city', 'postal_code', 'created_by',
];

public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Tambah import: `HasMany`.

#### `app/Models/Order.php` — rewrite
```php
protected $fillable = [
    'customer_id', 'total_price',
    'checked_out_at', 'cancelled_at', 'expired_at', 'created_by',
];

protected $appends = ['status'];

protected function casts(): array
{
    return [
        'total_price'    => 'integer',
        'checked_out_at' => 'datetime',
        'cancelled_at'   => 'datetime',
        'expired_at'     => 'datetime',
    ];
}

public function getStatusAttribute(): string
{
    if ($this->cancelled_at) { return 'cancelled'; }
    if ($this->checked_out_at) { return 'completed'; }
    if ($this->expired_at) { return 'expired'; }
    return 'pending';
}

public function customer(): BelongsTo
{
    return $this->belongsTo(Customer::class);
}

public function items(): HasMany
{
    return $this->hasMany(OrderItem::class);
}

public function invoice(): HasOne
{
    return $this->hasOne(Invoice::class);
}

public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Hapus: `user()`, `payment()`, `paid_at` dari fillable/casts.
Tambah import: `HasOne`, `Customer`, `Invoice`.

#### `app/Models/Payment.php` — update
```php
protected $fillable = [
    'invoice_id', 'amount', 'type', 'proof_image', 'note', 'created_by',
];

protected function casts(): array
{
    return ['amount' => 'integer'];
}

public function invoice(): BelongsTo
{
    return $this->belongsTo(Invoice::class);
}

public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Hapus: `order()`. Tambah import: `Invoice`.

#### `app/Models/Invoice.php` — buat baru
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'total_amount', 'due_date', 'notes', 'created_by',
    ];

    protected $appends = ['status', 'paid_amount', 'remaining_amount'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'due_date'     => 'date',
        ];
    }

    public function getStatusAttribute(): string
    {
        $paid = (int) $this->payments()->sum('amount');
        if ($paid <= 0) { return 'unpaid'; }
        if ($paid < $this->total_amount) { return 'partial'; }
        return 'paid';
    }

    public function getPaidAmountAttribute(): int
    {
        return (int) $this->payments()->sum('amount');
    }

    public function getRemainingAmountAttribute(): int
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

#### `app/Models/Offer.php` — tambah rejected_at + creator
Tambah ke `$fillable`: `'rejected_at'`
Tambah ke `casts()`: `'rejected_at' => 'datetime'`
Tambah `$appends = ['status']`
Tambah method:
```php
public function getStatusAttribute(): string
{
    if ($this->rejected_at) { return 'rejected'; }
    return 'active';
}

public function creator(): BelongsTo
{
    return $this->belongsTo(User::class, 'created_by');
}
```
Tambah import: `BelongsTo`.

#### `app/Observers/OrderObserver.php` — tambah `created()`

Observer saat ini hanya handle `updated`. Kasir flow set `checked_out_at` saat CREATE,
sehingga `updated` tidak akan trigger. Tambah method `created()`:

```php
public function created(Order $order): void
{
    if ($order->checked_out_at === null) {
        return;
    }
    $this->deductStock($order);
}

public function updated(Order $order): void
{
    if (! $order->wasChanged('checked_out_at')) { return; }
    if ($order->checked_out_at === null) { return; }
    if ($order->getOriginal('checked_out_at') !== null) { return; }
    $this->deductStock($order);
}

private function deductStock(Order $order): void
{
    foreach ($order->items()->get() as $item) {
        Stock::create([
            'product_id'     => $item->product_id,
            'quantity'       => -$item->quantity,
            'unit_cost'      => null,
            'type'           => 'out',
            'reference_id'   => $order->id,
            'reference_type' => 'order',
            'note'           => "Order #{$order->id} checkout",
            'created_by'     => auth()->id(),
        ]);
    }
}
```

---

## Files to Create

| File | Keterangan |
|---|---|
| `app/Http/Controllers/Admin/OrderController.php` | index, create, store, show, cancel |
| `app/Http/Controllers/Admin/InvoiceController.php` | storePayment |
| `app/Http/Requests/StoreOrderRequest.php` | Validasi buat order |
| `app/Http/Requests/StorePaymentRequest.php` | Validasi input payment |
| `resources/js/Pages/Order/Index.jsx` | Daftar order |
| `resources/js/Pages/Order/Create.jsx` | Form kasir |
| `resources/js/Pages/Order/Show.jsx` | Detail order + invoice + payments |

## Files to Modify

| File | Perubahan |
|---|---|
| `routes/web.php` | Tambah order + invoice routes |
| `resources/js/Layouts/Sidebar.jsx` | Tambah link Orders |

---

## Implementation Steps

### 1. StoreOrderRequest
```php
'customer_id'      => ['nullable', 'exists:customers,id'],
'items'            => ['required', 'array', 'min:1'],
'items.*.product_id' => ['required', 'exists:products,id'],
'items.*.quantity'   => ['required', 'integer', 'min:1'],
'items.*.price'      => ['required', 'integer', 'min:0'],
'due_date'         => ['nullable', 'date', 'after:today'],
'notes'            => ['nullable', 'string', 'max:255'],
'pay_now'          => ['boolean'],
'payment_type'     => ['nullable', 'required_if:pay_now,true', 'in:dp,installment,full'],
'payment_amount'   => ['nullable', 'required_if:pay_now,true', 'integer', 'min:1'],
```

### 2. StorePaymentRequest
```php
'amount'      => ['required', 'integer', 'min:1'],
'type'        => ['required', 'in:dp,installment,full'],
'proof_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
'note'        => ['nullable', 'string', 'max:255'],
```

### 3. OrderController
```php
public function index(Request $request): Response
{
    $search    = $request->query('search', '');
    $sort      = $request->query('sort', 'created_at');
    $direction = $request->query('direction', 'desc');
    $perPage   = $request->query('per_page', 10);

    $allowedSorts = ['created_at', 'total_price'];
    if (! in_array($sort, $allowedSorts, true)) { $sort = 'created_at'; }
    if (! in_array($direction, ['asc', 'desc'], true)) { $direction = 'desc'; }

    $orders = Order::query()
        ->select(['id', 'customer_id', 'total_price', 'created_at', 'created_by',
                  'checked_out_at', 'cancelled_at', 'expired_at'])
        ->with(['customer:id,name', 'creator:id,name', 'invoice'])
        ->when($search, fn ($q) => $q->whereHas('customer', fn ($c) =>
            $c->where('name', 'like', "%{$search}%")))
        ->orderBy($sort, $direction)
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('Order/Index', [
        'orders'  => $orders,
        'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
    ]);
}

public function create(): Response
{
    return Inertia::render('Order/Create', [
        'customers' => Customer::query()->select(['id', 'name'])->orderBy('name')->get(),
        'products'  => Product::query()
            ->select(['id', 'name', 'price'])
            ->withSum('stocks', 'quantity')
            ->get(),
    ]);
}

public function store(StoreOrderRequest $request): RedirectResponse
{
    DB::transaction(function () use ($request) {
        $validated  = $request->validated();
        $items      = $validated['items'];
        $totalPrice = collect($items)->sum(fn ($i) => $i['quantity'] * $i['price']);

        $order = Order::query()->create([
            'customer_id'    => $validated['customer_id'] ?? null,
            'total_price'    => $totalPrice,
            'checked_out_at' => now(),  // kasir: barang langsung diserahkan
            'created_by'     => auth()->id(),
        ]);

        foreach ($items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'price'      => $item['price'],
                'subtotal'   => $item['quantity'] * $item['price'],
                'created_by' => auth()->id(),
            ]);
        }

        $invoice = $order->invoice()->create([
            'total_amount' => $totalPrice,
            'due_date'     => $validated['due_date'] ?? null,
            'notes'        => $validated['notes'] ?? null,
            'created_by'   => auth()->id(),
        ]);

        if ($request->boolean('pay_now')) {
            $invoice->payments()->create([
                'amount'     => $validated['payment_amount'],
                'type'       => $validated['payment_type'],
                'created_by' => auth()->id(),
            ]);
        }
    });

    return redirect()->route('order.index')->with('success', 'Order created successfully.');
}

public function show(Order $order): Response
{
    $order->load([
        'customer',
        'items.product:id,name,thumbnail',
        'invoice.payments.creator:id,name',
        'creator:id,name',
    ]);

    return Inertia::render('Order/Show', ['order' => $order]);
}

public function cancel(Order $order): RedirectResponse
{
    if ($order->checked_out_at || $order->cancelled_at) {
        return back()->with('error', 'Order cannot be cancelled.');
    }
    $order->update(['cancelled_at' => now()]);
    return back()->with('success', 'Order cancelled.');
}
```

### 4. InvoiceController
```php
public function storePayment(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
{
    $data = $request->validated();

    if ($request->hasFile('proof_image')) {
        $data['proof_image'] = $request->file('proof_image')
            ->store('paymentProofs', 'public');
    }

    $invoice->payments()->create([
        ...$data,
        'created_by' => auth()->id(),
    ]);

    return back()->with('success', 'Payment recorded successfully.');
}
```

### 5. Routes

Tambah di dalam group `['auth', 'role:admin']`:
```php
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\OrderController;

Route::controller(OrderController::class)->prefix('/order')->name('order.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{order}', 'show')->name('show');
    Route::patch('/{order}/cancel', 'cancel')->name('cancel');
});

Route::controller(InvoiceController::class)->prefix('/invoice')->name('invoice.')->group(function () {
    Route::post('/{invoice}/payment', 'storePayment')->name('payment.store');
});
```

### 6. Order/Index.jsx
- `selectable={false}`, `addHref={route("order.create")}`, `addLabel="Add Order"`
- Grid: `"0.5fr 1.5fr 1fr 1fr 1fr 1fr 0.8fr"` (7 kolom)
- Redux: `setCurrentRoute({ route: 'order', subRoute: null })`

```jsx
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
        render: (item) => item.customer?.name ?? (
            <span className="text-slate-400 italic">Walk-in</span>
        ),
    },
    {
        key: "total_price",
        label: "Total",
        sortKey: "total_price",
        render: (item) => `Rp${item.total_price.toLocaleString('id-ID')}`,
    },
    {
        key: "status",
        label: "Status Order",
        render: (item) => {
            const map = {
                completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                pending:   'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                cancelled: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
                expired:   'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
            };
            return <span className={`px-2 py-1 rounded-lg text-sm font-bold ${map[item.status]}`}>{item.status}</span>;
        },
    },
    {
        key: "invoice_status",
        label: "Payment",
        render: (item) => {
            const map = {
                unpaid:  'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
                partial: 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
                paid:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            };
            const status = item.invoice?.status ?? 'unpaid';
            return <span className={`px-2 py-1 rounded-lg text-sm font-bold ${map[status]}`}>{status}</span>;
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
```

### 7. Order/Create.jsx (Kasir Form)
- Redux: `setCurrentRoute({ route: 'order', subRoute: null })`
- `useForm`:
  ```js
  { customer_id: null, items: [], due_date: '', notes: '',
    pay_now: false, payment_type: 'full', payment_amount: 0 }
  ```
- SelectInput customer (opsional, nullable) dari prop `customers`
- Dynamic item list — tiap baris: SelectInput produk (dari prop `products`), NumberInput qty,
  harga auto-fill dari produk yang dipilih (editable), subtotal read-only
- Total = `sum(item.qty * item.price)` ditampilkan di bawah list
- CheckboxInput / toggle `pay_now` → tampilkan SelectInput `payment_type` +
  NumberInput `payment_amount`
- TextInput `due_date` (type="date", opsional)
- TextAreaInput `notes` (opsional)
- Submit `post(route('order.store'))`

### 8. Order/Show.jsx
- Redux: `setCurrentRoute({ route: 'order', subRoute: null })`
- Header: "Order #ID", status badge, tombol Back ke `order.index`
- Tombol "Cancel" (merah) jika `order.status === 'pending'`

**Kiri — Info Order:**
- Customer name (atau italic "Walk-in"), status badge, tanggal, total

**Tabel Items** (pakai `@table-library` langsung, tanpa DataTable):
- Kolom: Thumbnail, Nama Produk, Qty, Harga Satuan, Subtotal
- Gunakan `tableStyle("auto 1.5fr 0.5fr 1fr 1fr", "order-items-table")`
- Total di bawah tabel

**Invoice & Payments:**
- Card: total tagihan, due_date, invoice status badge, paid_amount, remaining_amount
- Tabel payments: tanggal, type badge, nominal, bukti (link jika ada), catatan, created_by
  - type badges: `dp`=sky, `installment`=orange, `full`=emerald
- Form tambah payment (inline, di bawah tabel):
  - `useForm({ amount: 0, type: 'full', proof_image: null, note: '' })`
  - NumberInput amount, SelectInput type, ImageInput proof_image (optional), TextInput note
  - Submit `post(route('invoice.payment.store', order.invoice.id))` dengan `forceFormData: true`

### 9. Sidebar

Tambah di bawah Products (admin only):
```jsx
import { TbShoppingCart } from "react-icons/tb";

<Link href={route("order.index")}>
    <motion.div className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
        currentRoute.route === "order"
            ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
            : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
    }`} ...>
        <TbShoppingCart className="text-2xl mr-3" />
        <p className="font-bold text-lg">Orders</p>
    </motion.div>
</Link>
```

---

## Utilities to Reuse

| Utility | Path |
|---|---|
| `tableStyle()` | `resources/js/config/tableConfig.jsx` |
| `SelectInput` | `resources/js/Components/input/SelectInput.jsx` |
| `NumberInput` | `resources/js/Components/input/NumberInput.jsx` |
| `TextInput` | `resources/js/Components/input/TextInput.jsx` |
| `ImageInput` | `resources/js/Components/input/ImageInput.jsx` |
| `DataTable` | `resources/js/Components/DataTable.jsx` |

---

## Verification

1. `php artisan migrate:fresh` → tidak ada error
2. `php artisan route:list --name=order` → 5 routes muncul
3. `php artisan route:list --name=invoice` → 1 route muncul
4. Buat order walk-in + pay_now=true → tersimpan, invoice status 'paid'
5. Buat order untuk customer + due_date → invoice status 'unpaid'
6. Tambah payment DP 30% dari Show → invoice status 'partial'
7. Tambah payment sisa → invoice status 'paid'
8. Cancel order pending → cancelled_at terisi, tombol hilang
9. Order completed/cancelled → tidak ada tombol Cancel
