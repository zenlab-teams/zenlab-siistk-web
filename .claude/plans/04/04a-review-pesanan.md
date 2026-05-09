# Plan 04a — Review Implementasi Pesanan

> **Status: ✅ Plan 04 sudah dieksekusi lengkap.**
> File ini mendokumentasikan perbedaan antara plan 04 dan implementasi aktual.

---

## Hasil Review

Semua komponen Plan 04 sudah terimplementasi:

| Komponen | Status |
|---|---|
| Migration customers (rename + update) | ✅ |
| Migration orders (customer_id, hapus paid_at) | ✅ |
| Migration invoices (file baru `163400`) | ✅ |
| Migration payments (invoice_id, type, note) | ✅ |
| Migration offers (tambah rejected_at) | ✅ |
| Model Customer | ✅ |
| Model Order (status appends) | ✅ |
| Model Invoice (baru) | ✅ |
| Model Payment | ✅ |
| Model Offer (rejected_at + creator) | ✅ |
| OrderObserver (tambah created()) | ✅ |
| StoreOrderRequest | ✅ |
| StorePaymentRequest | ✅ |
| OrderController (index/create/store/show/cancel) | ✅ |
| InvoiceController (storePayment) | ✅ |
| Routes order + invoice | ✅ |
| Order/Index.jsx | ✅ |
| Order/Create.jsx | ✅ |
| Order/Show.jsx | ✅ |
| Sidebar (link Orders) | ✅ |

---

## Perbedaan dari Plan — Improvement yang Diterapkan

### 1. Harga produk diambil dari DB, bukan dari request

`OrderController::store()` mengabaikan price dari request dan fetch langsung dari DB:
```php
$productPrices = Product::query()
    ->whereIn('id', collect($items)->pluck('product_id')->unique()->values())
    ->pluck('price', 'id');
$totalPrice = collect($items)->sum(
    fn ($item) => $item['quantity'] * ((int) ($productPrices[$item['product_id']] ?? 0))
);
```

Konsekuensi: `StoreOrderRequest` **tidak** punya rule `items.*.price`.
- Backend mengabaikan price dari frontend → tidak bisa dimanipulasi
- Frontend tetap kirim price untuk keperluan kalkulasi display real-time
- Ini lebih aman dari plan asal yang menerima price dari request

### 2. OrderObserver `created()` pakai `DB::afterCommit`

Plan asal tidak mempertimbangkan bahwa `store()` menggunakan transaction. Ketika
observer `created` fire di dalam transaction, `order->items()` belum tersimpan. Solusi:

```php
public function created(Order $order): void
{
    if ($order->checked_out_at === null) { return; }
    DB::afterCommit(function () use ($order): void {
        $freshOrder = $order->fresh();
        if ($freshOrder === null) { return; }
        $this->deductStock($freshOrder);
    });
}
```

`DB::afterCommit` memastikan deductStock berjalan setelah seluruh transaction commit,
sehingga items sudah tersimpan saat stock di-deduct.

### 3. Invoice model pakai `resolvePaidAmount()` untuk menghindari query ganda

Plan asal pakai `$this->payments()->sum('amount')` langsung di tiap accessor. Karena
ada 3 accessor (`status`, `paid_amount`, `remaining_amount`) yang semuanya butuh nilai
yang sama, ini akan query DB 3x per invoice. Solusi:

```php
private bool $paidAmountResolved = false;
private int $paidAmountValue = 0;

private function resolvePaidAmount(): int
{
    if ($this->paidAmountResolved) { return $this->paidAmountValue; }
    $this->paidAmountValue = $this->relationLoaded('payments')
        ? (int) $this->payments->sum('amount')
        : (int) $this->payments()->sum('amount');
    $this->paidAmountResolved = true;
    return $this->paidAmountValue;
}
```

Juga pintar mengecek `relationLoaded('payments')` — kalau payments sudah eager-loaded
(misal di `Order/Show`), langsung pakai koleksi di memory tanpa query DB lagi.

### 4. Order/Index eager-load `invoice.payments` untuk invoice status

Karena `invoice.status` adalah `$appends` yang butuh `payments` untuk dihitung, index
query perlu eager-load payments sekalian agar `resolvePaidAmount()` tidak N+1:

```php
->with([
    'customer:id,name',
    'creator:id,name',
    'invoice',
    'invoice.payments:id,invoice_id,amount',
])
```

---

## Tidak Ada Gap

Tidak ada fitur dari Plan 04 yang terlewat. Semua perbedaan di atas adalah
improvement dari plan, bukan kekurangan.
