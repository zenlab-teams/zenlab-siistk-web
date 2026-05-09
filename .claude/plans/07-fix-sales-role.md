# Plan 07 — Fix Sales Role: Products & Offers

## Context

Ditemukan dua bug saat login sebagai user role `sales`:

1. **Products** — Link di Sidebar tanpa role check, mengarah ke `/admin/product`
   (`role:admin` middleware) → 403 untuk sales user.
2. **Offers** — `Sales/OfferController` memanggil `currentSale()` yang pakai
   `firstOrFail()`. Jika user sales tidak punya record di tabel `sales` (misalnya
   dibuat via seeder bukan via admin UI), request gagal dengan 404 generik.

---

## Fix 1 — Sidebar: Sembunyikan Products dari Sales

**File:** `resources/js/Layouts/Sidebar.jsx`

Wrap Products link dengan role check (sama seperti Orders dan Users):

```jsx
{user?.role === "admin" && (
    <Link href={route("product.index")}>
        <motion.div
            className={`flex items-center p-2 m-1 rounded-lg cursor-pointer transition-all ${
                currentRoute.route === "product"
                    ? "bg-sky-100 text-sky-500 dark:bg-sky-900"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            <TbPackage className="text-2xl mr-3" />
            <p className="font-bold text-lg">Products</p>
        </motion.div>
    </Link>
)}
```

> Sales tidak punya route product sendiri. Link disembunyikan sampai ada
> plan khusus untuk sales product view.

---

## Fix 2 — Sales/OfferController: Defensive currentSale()

**File:** `app/Http/Controllers/Sales/OfferController.php`

Ganti `firstOrFail()` dengan `first()` + abort manual agar pesan error jelas:

```php
private function currentSale(): Sale
{
    $sale = Sale::query()->where('user_id', auth()->id())->first();

    if ($sale === null) {
        abort(403, 'Akun sales Anda belum terdaftar. Hubungi administrator.');
    }

    return $sale;
}
```

> Root cause tetap perlu diselesaikan oleh admin: pastikan user role sales
> dibuat melalui admin UI agar Sale record otomatis terbuat via
> `UserController::syncRoleProfile()`.

---

## Files to Modify

| File | Perubahan |
|---|---|
| `resources/js/Layouts/Sidebar.jsx` | Wrap Products `<Link>` dengan `{user?.role === "admin" && ...}` |
| `app/Http/Controllers/Sales/OfferController.php` | Ganti `firstOrFail()` → `first()` + `abort(403, ...)` |

---

## Verification

1. Login sebagai sales → sidebar **tidak** tampilkan Products ✓
2. Login sebagai sales → sidebar **tetap** tampilkan Offers ✓
3. Klik Offers → halaman terbuka normal ✓
4. Sales user tanpa Sale record → 403 dengan pesan jelas, bukan 404 kosong ✓
5. Login sebagai admin → Products masih ada di sidebar ✓
