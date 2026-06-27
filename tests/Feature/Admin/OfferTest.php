<?php

use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\OfferSale;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeOfferAdmin(): User
{
    return User::query()->create([
        'name' => 'Admin', 'email' => 'admin@offer.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);
}

function makeOfferSalesUser(int $adminId): array
{
    $user = User::query()->create([
        'name' => 'Sales', 'email' => 'sales@offer.com',
        'password' => bcrypt('pass'), 'role' => 'sales',
    ]);
    $sale = Sale::query()->create([
        'user_id' => $user->id, 'phone' => '08112345678', 'created_by' => $adminId,
    ]);
    return [$user, $sale];
}

function makeOfferProduct(int $adminId, int $stock = 100): Product
{
    $product = Product::query()->create([
        'name' => 'Produk Offer', 'price' => 10000, 'created_by' => $adminId,
    ]);
    if ($stock > 0) {
        Stock::query()->create([
            'product_id' => $product->id, 'quantity' => $stock,
            'type' => 'in', 'created_by' => $adminId,
        ]);
    }
    return $product;
}

function makeBaseOffer(int $adminId, int $saleId, int $productId): Offer
{
    $offer = Offer::query()->create([
        'name' => 'Penawaran Test', 'date' => now()->toDateString(),
        'location' => 'Pasar Kota', 'created_by' => $adminId,
    ]);
    OfferItem::query()->create([
        'offer_id' => $offer->id, 'product_id' => $productId,
        'quantity' => 20, 'offered_price' => 9000, 'subtotal' => 180000,
        'created_by' => $adminId,
    ]);
    OfferSale::query()->create([
        'offer_id' => $offer->id, 'sale_id' => $saleId, 'created_by' => $adminId,
    ]);
    return $offer;
}

// ─── OFFER INDEX / CREATE ────────────────────────────────────────────────────

// TC-OFFER-001: Admin dapat mengakses daftar penawaran
test('admin dapat mengakses halaman daftar penawaran', function () {
    $admin = makeOfferAdmin();
    $this->actingAs($admin)->get(route('offer.index'))->assertOk();
});

// TC-OFFER-002: Guest diredirect ke login
test('guest tidak dapat mengakses halaman penawaran', function () {
    $this->get(route('offer.index'))->assertRedirect(route('login'));
});

// TC-OFFER-003: Admin dapat membuat penawaran baru dengan data valid
test('admin dapat membuat penawaran baru', function () {
    $admin          = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product        = makeOfferProduct($admin->id);

    $response = $this->actingAs($admin)->post(route('offer.store'), [
        'name'     => 'Penawaran Baru',
        'date'     => now()->toDateString(),
        'location' => 'Pasar Minggu',
        'sale_ids' => [$sale->id],
        'items'    => [
            ['product_id' => $product->id, 'quantity' => 5, 'offered_price' => 9500],
        ],
    ]);

    $response->assertRedirect(route('offer.index'));
    $this->assertDatabaseHas('offers', ['name' => 'Penawaran Baru']);
});

// TC-OFFER-004: Pembuatan penawaran gagal jika tanggal kosong
test('pembuatan penawaran gagal jika tanggal kosong', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id);

    $response = $this->actingAs($admin)->post(route('offer.store'), [
        'name'     => 'Penawaran Tanpa Tanggal',
        'date'     => '',
        'location' => 'Lokasi',
        'sale_ids' => [$sale->id],
        'items'    => [
            ['product_id' => $product->id, 'quantity' => 5, 'offered_price' => 9000],
        ],
    ]);

    $response->assertSessionHasErrors('date');
});

// TC-OFFER-005: Admin dapat melihat detail penawaran
test('admin dapat melihat detail penawaran', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);

    $this->actingAs($admin)->get(route('offer.show', $offer))->assertOk();
});

// ─── OFFER COMPLETE / REJECT ─────────────────────────────────────────────────

// TC-OFFER-006: Admin dapat menyelesaikan penawaran aktif
test('admin dapat menyelesaikan penawaran aktif', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);

    $this->actingAs($admin)->patch(route('offer.complete', $offer))
        ->assertRedirect();

    $this->assertDatabaseHas('offers', [
        'id'          => $offer->id,
        'completed_at' => now()->toDateTimeString(),
    ]);
})->skip('Memerlukan waktu tepat — gunakan Carbon::setTestNow di lingkungan CI');

test('admin dapat menyelesaikan penawaran dan stok retur tersimpan', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id, 100);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);

    $this->actingAs($admin)->patch(route('offer.complete', $offer));

    $offer->refresh();
    expect($offer->completed_at)->not->toBeNull();

    // 20 unit belum terjual → harus ada entri stok retur
    $this->assertDatabaseHas('stocks', [
        'product_id'     => $product->id,
        'quantity'       => 20,
        'type'           => 'in',
        'reference_type' => Offer::class,
    ]);
});

// TC-OFFER-007: Admin tidak dapat menyelesaikan penawaran yang sudah selesai
test('admin tidak dapat menyelesaikan penawaran yang sudah selesai', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);
    $offer->update(['completed_at' => now()]);

    $this->actingAs($admin)->patch(route('offer.complete', $offer))
        ->assertSessionHas('error');
});

// TC-OFFER-008: Admin dapat menolak penawaran aktif
test('admin dapat menolak penawaran aktif dan stok dikembalikan', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id, 100);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);

    $this->actingAs($admin)->patch(route('offer.reject', $offer));

    $offer->refresh();
    expect($offer->rejected_at)->not->toBeNull();

    $this->assertDatabaseHas('stocks', [
        'product_id'     => $product->id,
        'quantity'       => 20,
        'type'           => 'in',
        'reference_type' => Offer::class,
    ]);
});

// TC-OFFER-009: Admin tidak dapat menolak penawaran yang sudah ditolak
test('admin tidak dapat menolak penawaran yang sudah ditolak', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);
    $offer->update(['rejected_at' => now()]);

    $this->actingAs($admin)->patch(route('offer.reject', $offer))
        ->assertSessionHas('error');
});

// ─── OFFER RECORD ────────────────────────────────────────────────────────────

// TC-OFFER-010: Admin dapat menyetujui record penjualan dan order dibuat
test('admin dapat menyetujui record dan order + invoice dibuat', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $customer           = Customer::query()->create([
        'name' => 'Pelanggan A', 'address' => 'Jl. A', 'created_by' => $admin->id,
    ]);
    $product = makeOfferProduct($admin->id, 50);
    $offer   = makeBaseOffer($admin->id, $sale->id, $product->id);

    $record = OfferRecord::query()->create([
        'offer_id'    => $offer->id,
        'sale_id'     => $sale->id,
        'customer_id' => $customer->id,
        'status'      => 'pending',
        'created_by'  => $salesUser->id,
    ]);
    OfferRecordItem::query()->create([
        'offer_record_id' => $record->id,
        'product_id'      => $product->id,
        'quantity'        => 3,
        'sold_price'      => 10500,
        'subtotal'        => 31500,
        'created_by'      => $salesUser->id,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('offer.record.approve', [$offer, $record]));

    $order = Order::query()->with('invoice')->firstOrFail();
    $response->assertRedirect(route('order.show', $order));
    expect($order->total_price)->toBe(31500);
    expect($order->invoice)->not->toBeNull();

    $record->refresh();
    expect($record->status)->toBe('approved');
});

// TC-OFFER-011: Admin dapat menolak record penjualan
test('admin dapat menolak record penjualan', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $product            = makeOfferProduct($admin->id, 50);
    $offer              = makeBaseOffer($admin->id, $sale->id, $product->id);

    $record = OfferRecord::query()->create([
        'offer_id'   => $offer->id,
        'sale_id'    => $sale->id,
        'status'     => 'pending',
        'created_by' => $salesUser->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('offer.record.reject', [$offer, $record]))
        ->assertRedirect();

    $record->refresh();
    expect($record->status)->toBe('rejected');
});

// TC-OFFER-012: Record yang sudah diproses tidak bisa disetujui lagi
test('record yang sudah disetujui tidak dapat disetujui kembali', function () {
    $admin              = makeOfferAdmin();
    [$salesUser, $sale] = makeOfferSalesUser($admin->id);
    $customer           = Customer::query()->create([
        'name' => 'Pelanggan B', 'address' => 'Jl. B', 'created_by' => $admin->id,
    ]);
    $product = makeOfferProduct($admin->id);
    $offer   = makeBaseOffer($admin->id, $sale->id, $product->id);

    $record = OfferRecord::query()->create([
        'offer_id'    => $offer->id,
        'sale_id'     => $sale->id,
        'customer_id' => $customer->id,
        'status'      => 'approved',
        'created_by'  => $salesUser->id,
    ]);

    $this->actingAs($admin)
        ->post(route('offer.record.approve', [$offer, $record]))
        ->assertSessionHas('error');
});
