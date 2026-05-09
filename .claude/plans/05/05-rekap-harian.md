# Plan 05 — Rekap Harian (Dashboard Admin)

## Context

Admin dashboard menampilkan ringkasan kondisi bisnis hari ini. Revenue dihitung dari
`payments` (uang masuk aktual), bukan `orders.total_price`. Pending payment dihitung
dari invoice yang belum lunas.

**Bergantung pada Plan 04** (invoice + payments model harus sudah ada).

---

## Files to Modify

| File | Perubahan |
|---|---|
| `app/Http/Controllers/Admin/DashboardController.php` | Rewrite query aggregasi |
| `resources/js/Pages/Dashboard.jsx` | Tampilkan kartu rekap + tabel ringkasan |

---

## Data yang Ditampilkan

### Kartu Statistik (Atas)

| Kartu | Data | Sumber |
|---|---|---|
| Omzet Hari Ini | SUM `payments.amount` WHERE `created_at` = hari ini | `payments` |
| Pesanan Masuk | COUNT orders WHERE `created_at` = hari ini | `orders` |
| Pesanan Selesai | COUNT orders WHERE `checked_out_at` = hari ini | `orders` |
| Pending Bayar | COUNT orders (checked_out) WHERE invoice belum lunas | `invoices` + `payments` |
| Stok Kritis | COUNT products WHERE currentStock ≤ 5 | `stocks` |

### Tabel Ringkasan (Bawah)
- **Pesanan Terbaru** — 5 order terbaru dengan status order + invoice
- **Produk Stok Rendah** — produk dengan stok ≤ 5, sorted ascending

---

## Implementation Steps

### 1. DashboardController
```php
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;

public function index(): Response
{
    $today = today();

    $stats = [
        'revenue_today' => Payment::query()
            ->whereDate('created_at', $today)
            ->sum('amount'),

        'orders_today' => Order::query()
            ->whereDate('created_at', $today)
            ->count(),

        'completed_today' => Order::query()
            ->whereDate('checked_out_at', $today)
            ->count(),

        'pending_payment' => Order::query()
            ->whereNotNull('checked_out_at')
            ->whereNull('cancelled_at')
            ->whereHas('invoice', fn ($q) => $q->whereRaw(
                '(SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = invoices.id) < invoices.total_amount'
            ))
            ->count(),

        'low_stock_count' => Product::query()
            ->withSum('stocks', 'quantity')
            ->having('stocks_sum_quantity', '<=', 5)
            ->count(),
    ];

    $recentOrders = Order::query()
        ->select(['id', 'customer_id', 'total_price', 'created_at',
                  'checked_out_at', 'cancelled_at', 'expired_at'])
        ->with(['customer:id,name', 'invoice'])
        ->latest()
        ->limit(5)
        ->get();

    $lowStockProducts = Product::query()
        ->select(['id', 'name', 'thumbnail'])
        ->withSum('stocks', 'quantity')
        ->having('stocks_sum_quantity', '<=', 5)
        ->orderBy('stocks_sum_quantity')
        ->limit(10)
        ->get();

    return Inertia::render('Dashboard', compact('stats', 'recentOrders', 'lowStockProducts'));
}
```

### 2. Dashboard.jsx

Redux: `setCurrentRoute({ route: 'dashboard', subRoute: null })`

**Stat Cards (5 kolom):**
```jsx
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
            <Icon className={`text-xl text-${color}-500`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
    </div>
);

<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <StatCard icon={TbCurrencyDollar} label="Omzet Hari Ini"
        value={`Rp${stats.revenue_today.toLocaleString('id-ID')}`} color="emerald" />
    <StatCard icon={TbShoppingCart} label="Pesanan Masuk"
        value={stats.orders_today} color="sky" />
    <StatCard icon={TbCheck} label="Selesai"
        value={stats.completed_today} color="teal" />
    <StatCard icon={TbClock} label="Pending Bayar"
        value={stats.pending_payment} color="orange" />
    <StatCard icon={TbAlertTriangle} label="Stok Kritis"
        value={stats.low_stock_count} color="red" />
</div>
```

**Import icons:** `TbCurrencyDollar, TbShoppingCart, TbCheck, TbClock, TbAlertTriangle, TbPhoto`
dari `react-icons/tb`.

**Tabel Pesanan Terbaru (kiri):**
- Plain HTML table (bukan DataTable — tidak butuh pagination)
- Kolom: Customer, Total, Status Order, Payment, Tanggal
- Customer: `order.customer?.name ?? <italic>Walk-in</italic>`
- Status order badge: completed=emerald, pending=slate, cancelled=red, expired=orange
- Payment badge (dari `order.invoice?.status`): unpaid=red, partial=orange, paid=emerald
- Link "Lihat Semua →" ke `route('order.index')` di bawah tabel

**Tabel Stok Kritis (kanan):**
- Plain HTML table
- Kolom: Thumbnail (w-8 h-8 rounded), Nama Produk, Stok (merah)
- Thumbnail placeholder jika null: `TbPhoto` icon
- Link "Lihat Semua →" ke `route('product.index')` di bawah tabel

**Layout dua kolom:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {/* Pesanan Terbaru */}
    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl"> ... </div>
    {/* Stok Kritis */}
    <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl"> ... </div>
</div>
```

---

## Utilities to Reuse

- Status badge pattern dari Plan 04 (Order/Index.jsx)
- Existing `Dashboard.jsx` di `resources/js/Pages/Dashboard.jsx` (cek apakah sudah ada)

---

## Verification

1. Dashboard menampilkan 5 stat cards
2. Omzet = SUM payments hari ini (bukan total_price orders)
3. Pending Bayar = order completed tapi invoice belum lunas
4. Pesanan terbaru menampilkan customer "Walk-in" untuk order tanpa customer
5. Stok Kritis tampil dan sorted ascending
6. Semua angka 0 ditampilkan dengan benar saat tidak ada data
