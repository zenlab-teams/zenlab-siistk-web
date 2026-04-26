# Plan 05 — Rekap Harian (Dashboard Admin)

## Context

Admin dashboard perlu menampilkan ringkasan kondisi bisnis hari ini: omzet, jumlah pesanan,
stok kritis, dan trend. Saat ini `AdminDashboard` hanya return view kosong. Bergantung pada
**Plan 04** (Mengelola Pesanan) agar ada data order yang bisa direkap.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `app/Http/Controllers/Admin/DashboardController.php` | Tambah query aggregasi untuk rekap |
| `resources/js/Pages/Dashboard.jsx` (atau halaman admin dashboard) | Tampilkan kartu rekap + tabel ringkasan |

---

## Data yang Ditampilkan

### Kartu Statistik (Atas)
| Kartu | Data | Sumber |
|---|---|---|
| Omzet Hari Ini | SUM `orders.total_price` WHERE `checked_out_at` = hari ini | `orders` |
| Pesanan Masuk | COUNT orders WHERE `created_at` = hari ini | `orders` |
| Pesanan Selesai | COUNT orders WHERE `checked_out_at` = hari ini | `orders` |
| Pesanan Pending Bayar | COUNT orders WHERE `paid_at` IS NOT NULL AND `checked_out_at` IS NULL | `orders` |
| Stok Kritis | COUNT products WHERE currentStock ≤ threshold (misal: ≤ 5) | `stocks` |

### Tabel Ringkasan (Bawah)
- **Pesanan Terbaru** — 5 order terbaru dengan status
- **Produk Stok Rendah** — produk dengan stok ≤ 5, sorted by stok ascending

---

## Implementation Steps

### 1. DashboardController

```php
public function index(): Response
{
    $today = today();

    $stats = [
        'revenue_today'   => Order::query()
            ->whereDate('checked_out_at', $today)
            ->sum('total_price'),

        'orders_today'    => Order::query()
            ->whereDate('created_at', $today)
            ->count(),

        'completed_today' => Order::query()
            ->whereDate('checked_out_at', $today)
            ->count(),

        'pending_payment' => Order::query()
            ->whereNotNull('paid_at')
            ->whereNull('checked_out_at')
            ->whereNull('cancelled_at')
            ->count(),

        'low_stock_count' => Product::query()
            ->withSum('stocks', 'quantity')
            ->having('stocks_sum_quantity', '<=', 5)
            ->count(),
    ];

    $recentOrders = Order::query()
        ->with(['user:id,name'])
        ->latest()
        ->limit(5)
        ->get(['id', 'user_id', 'total_price', 'created_at',
                'paid_at', 'checked_out_at', 'cancelled_at']);

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

Layout 2 bagian:

**Baris 1 — Stat Cards (grid 5 kolom, atau 2+3):**
```jsx
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <StatCard icon={TbCurrencyDollar} label="Omzet Hari Ini" value={`Rp${stats.revenue_today.toLocaleString('id-ID')}`} color="emerald" />
    <StatCard icon={TbShoppingCart}  label="Pesanan Masuk"  value={stats.orders_today}    color="sky" />
    <StatCard icon={TbCheck}         label="Selesai"        value={stats.completed_today}  color="green" />
    <StatCard icon={TbClock}         label="Pending Bayar"  value={stats.pending_payment}  color="yellow" />
    <StatCard icon={TbAlertTriangle} label="Stok Kritis"    value={stats.low_stock_count}  color="red" />
</div>
```

`StatCard` adalah component kecil inline (tidak perlu file terpisah):
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
```

**Baris 2 — Dua tabel side by side:**

Kiri: **Pesanan Terbaru**
- Tabel sederhana (bukan DataTable — tidak butuh pagination/select)
- Kolom: Customer, Total, Status badge, Tanggal
- Link "Lihat Semua" → `order.index`

Kanan: **Stok Kritis**
- Tabel sederhana
- Kolom: Thumbnail, Nama Produk, Stok (merah jika ≤ 5)
- Link "Lihat Semua" → `product.index`

### 3. Sidebar
Dashboard sudah ada di Sidebar — tidak perlu perubahan.

---

## Utilities to Reuse

- Status logic dari Plan 04 (badge warna)
- `tableStyle()` — `resources/js/config/tableConfig.jsx` (jika pakai table library)
- Atau plain HTML table untuk rekap sederhana (lebih ringan)

---

## Verification

1. Dashboard menampilkan 5 stat cards dengan data yang benar
2. Omzet = SUM order yang `checked_out_at` = hari ini
3. Pesanan terbaru tampil 5 item dengan status badge
4. Produk stok kritis tampil dan terurut dari stok paling rendah
5. Data 0 ditampilkan dengan benar (bukan error) saat tidak ada order hari ini
