<?php

use App\Models\Customer;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeAdmin(): User
{
    return User::query()->create([
        'name'     => 'Admin Test',
        'email'    => 'admin@test.com',
        'password' => bcrypt('password'),
        'role'     => 'admin',
    ]);
}

function makeProduct(int $adminId, string $name = 'Produk A', int $price = 10000): Product
{
    return Product::query()->create([
        'name'        => $name,
        'description' => 'Deskripsi produk',
        'price'       => $price,
        'created_by'  => $adminId,
    ]);
}

// ─────────────────────────────
// PRODUCT TESTS
// ─────────────────────────────

// TC-PROD-001: Admin dapat melihat daftar produk
test('admin dapat mengakses halaman daftar produk', function () {
    $admin = makeAdmin();
    $this->actingAs($admin)->get(route('product.index'))
        ->assertOk();
});

// TC-PROD-002: Guest tidak dapat mengakses halaman produk
test('guest tidak dapat mengakses halaman daftar produk', function () {
    $this->get(route('product.index'))
        ->assertRedirect(route('login'));
});

// TC-PROD-003: Admin dapat membuat produk baru dengan data valid
test('admin dapat membuat produk baru', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->post(route('product.store'), [
        'name'        => 'Produk Baru',
        'price'       => 25000,
        'description' => 'Deskripsi produk baru',
    ]);

    $response->assertRedirect(route('product.index'));
    $this->assertDatabaseHas('products', [
        'name'       => 'Produk Baru',
        'price'      => 25000,
        'created_by' => $admin->id,
    ]);
});

// TC-PROD-004: Pembuatan produk gagal jika nama kosong
test('pembuatan produk gagal jika nama kosong', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->post(route('product.store'), [
        'name'  => '',
        'price' => 25000,
    ]);

    $response->assertSessionHasErrors('name');
    $this->assertDatabaseCount('products', 0);
});

// TC-PROD-005: Pembuatan produk gagal jika harga negatif
test('pembuatan produk gagal jika harga negatif', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->post(route('product.store'), [
        'name'  => 'Produk Negatif',
        'price' => -1000,
    ]);

    $response->assertSessionHasErrors('price');
});

// TC-PROD-006: Admin dapat melihat detail produk
test('admin dapat melihat detail produk', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    $this->actingAs($admin)->get(route('product.show', $product))
        ->assertOk();
});

// TC-PROD-007: Admin dapat mengedit produk
test('admin dapat memperbarui produk', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    $response = $this->actingAs($admin)->put(route('product.update', $product), [
        'name'        => 'Produk Diperbarui',
        'price'       => 30000,
        'description' => 'Deskripsi diperbarui',
    ]);

    $response->assertRedirect(route('product.index'));
    $this->assertDatabaseHas('products', [
        'id'    => $product->id,
        'name'  => 'Produk Diperbarui',
        'price' => 30000,
    ]);
});

// TC-PROD-008: Admin dapat menghapus produk
test('admin dapat menghapus produk', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    $this->actingAs($admin)->delete(route('product.destroy', $product))
        ->assertRedirect(route('product.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

// TC-PROD-009: Admin dapat mencari produk
test('admin dapat mencari produk berdasarkan nama', function () {
    $admin    = makeAdmin();
    makeProduct($admin->id, 'Susu Murni', 5000);
    makeProduct($admin->id, 'Teh Manis', 3000);

    $response = $this->actingAs($admin)->get(route('product.index', ['search' => 'Susu']));
    $response->assertOk();
});

// TC-PROD-010: Admin dapat menghapus beberapa produk sekaligus
test('admin dapat menghapus beberapa produk sekaligus', function () {
    $admin    = makeAdmin();
    $product1 = makeProduct($admin->id, 'Produk 1', 10000);
    $product2 = makeProduct($admin->id, 'Produk 2', 20000);

    $this->actingAs($admin)
        ->delete(route('product.destroySelected', ['ids' => "{$product1->id},{$product2->id}"]))
        ->assertRedirect(route('product.index'));

    $this->assertDatabaseMissing('products', ['id' => $product1->id]);
    $this->assertDatabaseMissing('products', ['id' => $product2->id]);
});

// ─────────────────────────────
// STOCK TESTS
// ─────────────────────────────

// TC-STOCK-001: Admin dapat menambah stok masuk
test('admin dapat menambah stok masuk untuk produk', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    $this->actingAs($admin)->post(route('product.stock.store', $product), [
        'quantity'  => 100,
        'type'      => 'in',
        'unit_cost' => 8000,
        'note'      => 'Stok awal',
    ])->assertRedirect(route('product.show', $product));

    $this->assertDatabaseHas('stocks', [
        'product_id' => $product->id,
        'quantity'   => 100,
        'type'       => 'in',
    ]);
});

// TC-STOCK-002: Admin dapat menambah stok keluar
test('admin dapat mencatat stok keluar untuk produk', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    // Tambah stok masuk dahulu
    Stock::query()->create([
        'product_id' => $product->id,
        'quantity'   => 50,
        'type'       => 'in',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)->post(route('product.stock.store', $product), [
        'quantity'  => 10,
        'type'      => 'out',
        'unit_cost' => null,
        'note'      => 'Penjualan',
    ])->assertRedirect(route('product.show', $product));

    $this->assertDatabaseHas('stocks', [
        'product_id' => $product->id,
        'quantity'   => -10,
        'type'       => 'out',
    ]);
});

// TC-STOCK-003: Penambahan stok gagal jika quantity nol
test('penambahan stok gagal jika quantity nol', function () {
    $admin   = makeAdmin();
    $product = makeProduct($admin->id);

    $response = $this->actingAs($admin)->post(route('product.stock.store', $product), [
        'quantity' => 0,
        'type'     => 'in',
    ]);

    $response->assertSessionHasErrors('quantity');
});

// ─────────────────────────────
// CUSTOMER TESTS
// ─────────────────────────────

// TC-CUST-001: Admin dapat melihat daftar customer
test('admin dapat mengakses halaman daftar customer', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)->get(route('customer.index'))
        ->assertOk();
});

// TC-CUST-002: Admin dapat membuat customer baru
test('admin dapat membuat customer baru', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->post(route('customer.store'), [
        'name'    => 'Budi Santoso',
        'email'   => 'budi@example.com',
        'phone'   => '081234567890',
        'address' => 'Jl. Mawar No. 10',
    ]);

    $response->assertRedirect(route('customer.index'));
    $this->assertDatabaseHas('customers', [
        'name'  => 'Budi Santoso',
        'email' => 'budi@example.com',
    ]);
});

// TC-CUST-003: Pembuatan customer gagal jika nama kosong
test('pembuatan customer gagal jika nama kosong', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->post(route('customer.store'), [
        'name'    => '',
        'address' => 'Jl. Contoh No. 1',
    ]);

    $response->assertSessionHasErrors('name');
});

// TC-CUST-004: Admin dapat mengedit customer
test('admin dapat memperbarui data customer', function () {
    $admin    = makeAdmin();
    $customer = Customer::query()->create([
        'name'       => 'Lama Name',
        'address'    => 'Jl. Lama',
        'created_by' => $admin->id,
    ]);

    $response = $this->actingAs($admin)->put(route('customer.update', $customer), [
        'name'    => 'Nama Baru',
        'email'   => 'baru@example.com',
        'address' => 'Jl. Baru No. 5',
    ]);

    $response->assertRedirect(route('customer.index'));
    $this->assertDatabaseHas('customers', [
        'id'   => $customer->id,
        'name' => 'Nama Baru',
    ]);
});

// TC-CUST-005: Admin dapat menghapus customer
test('admin dapat menghapus customer', function () {
    $admin    = makeAdmin();
    $customer = Customer::query()->create([
        'name'       => 'Hapus Saya',
        'address'    => 'Jl. Hapus',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)->delete(route('customer.destroy', $customer))
        ->assertRedirect(route('customer.index'));

    $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
});
