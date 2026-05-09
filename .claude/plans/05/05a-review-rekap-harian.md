# Plan 05a — Review Implementasi Rekap Harian

> **Status: ✅ Plan 05 sudah dieksekusi lengkap.**

---

## Hasil Review

| Komponen | Status |
|---|---|
| DashboardController — revenue dari payments | ✅ |
| DashboardController — pending_payment dari invoice | ✅ |
| DashboardController — low_stock pakai COALESCE | ✅ |
| DashboardController — recentOrders eager-load invoice.payments | ✅ |
| Dashboard.jsx — 5 StatCard | ✅ |
| Dashboard.jsx — Pesanan Terbaru (customer + status + payment badge) | ✅ |
| Dashboard.jsx — Produk Stok Kritis (thumbnail + nama + stok) | ✅ |
| Dashboard.jsx — Walk-in ditampilkan italic | ✅ |
| Dashboard.jsx — Link "Lihat Semua" ke order.index + product.index | ✅ |

---

## Perbedaan dari Plan — Improvement yang Diterapkan

### 1. `low_stock_count` pakai query yang di-reuse

Plan asal query dua kali (satu untuk count, satu untuk list). Implementasi
memakai satu base query yang di-clone:

```php
$lowStockProductsQuery = Product::query()
    ->select(['id', 'name', 'thumbnail'])
    ->withSum('stocks', 'quantity')
    ->havingRaw('COALESCE(stocks_sum_quantity, 0) <= 5');

'low_stock_count' => (clone $lowStockProductsQuery)->get()->count(),

$lowStockProducts = (clone $lowStockProductsQuery)
    ->orderByRaw('COALESCE(stocks_sum_quantity, 0)')
    ->limit(10)
    ->get();
```

Juga pakai `havingRaw('COALESCE(stocks_sum_quantity, 0) <= 5')` — lebih robust
dari `having('stocks_sum_quantity', '<=', 5)` karena handle produk tanpa stock entry
(sum = NULL → COALESCE jadi 0).

### 2. StatCard pakai `cardColorMap` (bukan dynamic Tailwind string)

Plan asal menggunakan `bg-${color}-100` yang tidak akan masuk ke Tailwind purge
di production build. Implementasi memakai object map dengan class statis:

```jsx
const cardColorMap = {
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-500 dark:text-emerald-400" },
    sky:     { bg: "bg-sky-100 dark:bg-sky-900/30",         text: "text-sky-500 dark:text-sky-400" },
    // ...
};
```

Ini pendekatan yang benar — semua class Tailwind harus literal agar tidak di-purge.

### 3. `statusClassMap` dan `paymentClassMap` diletakkan di level module

Dibanding didefinisikan ulang di dalam komponen tiap render, keduanya diekstrak
sebagai konstanta di luar komponen sehingga tidak re-created setiap render.

---

## Satu Hal yang Perlu Diperhatikan

### `get()->count()` untuk `low_stock_count` kurang efisien

```php
'low_stock_count' => (clone $lowStockProductsQuery)->get()->count(),
```

Ini mengambil seluruh baris ke memory hanya untuk menghitung jumlahnya.
Untuk dataset kecil tidak masalah, tapi idealnya:

```php
'low_stock_count' => (clone $lowStockProductsQuery)->count(),
```

Namun perlu dicek apakah `->count()` bekerja benar dengan `withSum` + `havingRaw`
di MySQL (ada edge case di mana Laravel tidak wrap subquery dengan benar).
Kalau `->count()` memberikan hasil yang salah, `->get()->count()` adalah workaround
yang valid — fungsionalnya sama, hanya kurang optimal.

> **Tidak perlu diubah sekarang** — data produk biasanya kecil. Ini hanya catatan
> untuk referensi jika kelak performa jadi concern.
