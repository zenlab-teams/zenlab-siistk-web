<?php

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ────────────────────────────────────────────────────────────────

function orderAdmin(): User
{
    return User::query()->create([
        'name' => 'Admin', 'email' => 'admin@order.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);
}

function orderCustomer(int $adminId): Customer
{
    return Customer::query()->create([
        'name' => 'Customer Test', 'email' => 'cust@test.com',
        'address' => 'Jl. Test No. 1', 'created_by' => $adminId,
    ]);
}

function orderProduct(int $adminId): Product
{
    $product = Product::query()->create([
        'name' => 'Produk Order', 'price' => 15000, 'created_by' => $adminId,
    ]);
    Stock::query()->create([
        'product_id' => $product->id, 'quantity' => 100,
        'type' => 'in', 'created_by' => $adminId,
    ]);
    return $product;
}

// ─── ORDER TESTS ─────────────────────────────────────────────────────────────

// TC-ORD-001: Admin dapat mengakses halaman daftar order
test('admin dapat mengakses halaman daftar order', function () {
    $admin = orderAdmin();
    $this->actingAs($admin)->get(route('order.index'))->assertOk();
});

// TC-ORD-002: Guest tidak dapat mengakses halaman order
test('guest tidak dapat mengakses halaman order', function () {
    $this->get(route('order.index'))->assertRedirect(route('login'));
});

// TC-ORD-003: Admin dapat membuat order baru dengan data valid
test('admin dapat membuat order baru', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);
    $product  = orderProduct($admin->id);

    $response = $this->actingAs($admin)->post(route('order.store'), [
        'customer_id' => $customer->id,
        'items'       => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertRedirect(route('order.index'));
    $this->assertDatabaseHas('orders', ['customer_id' => $customer->id]);
    $this->assertDatabaseHas('invoices', ['total_amount' => 30000]);
});

// TC-ORD-004: Order dibuat tanpa customer (walk-in)
test('admin dapat membuat order tanpa customer walk-in', function () {
    $admin   = orderAdmin();
    $product = orderProduct($admin->id);

    $response = $this->actingAs($admin)->post(route('order.store'), [
        'customer_id' => null,
        'items'       => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    $response->assertRedirect(route('order.index'));
    $this->assertDatabaseHas('orders', ['customer_id' => null]);
});

// TC-ORD-005: Order gagal dibuat jika tidak ada items
test('pembuatan order gagal jika items kosong', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);

    $response = $this->actingAs($admin)->post(route('order.store'), [
        'customer_id' => $customer->id,
        'items'       => [],
    ]);

    $response->assertSessionHasErrors('items');
});

// TC-ORD-006: Admin dapat melihat detail order
test('admin dapat melihat detail order', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);
    $product  = orderProduct($admin->id);

    $order = Order::query()->create([
        'customer_id'    => $customer->id,
        'total_price'    => 15000,
        'checked_out_at' => now(),
        'created_by'     => $admin->id,
    ]);
    $order->items()->create([
        'product_id' => $product->id, 'quantity' => 1,
        'price' => 15000, 'subtotal' => 15000, 'created_by' => $admin->id,
    ]);
    $order->invoice()->create([
        'total_amount' => 15000, 'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)->get(route('order.show', $order))->assertOk();
});

// TC-ORD-007: Total harga order dihitung otomatis dari harga produk
test('total harga order dihitung otomatis berdasarkan harga produk', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);
    $product  = orderProduct($admin->id); // harga 15000

    $this->actingAs($admin)->post(route('order.store'), [
        'customer_id' => $customer->id,
        'items'       => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
    ]);

    $order = Order::query()->first();
    expect($order->total_price)->toBe(45000); // 3 × 15000
});

// TC-ORD-008: Admin dapat membuat order dengan pembayaran langsung
test('admin dapat membuat order dengan opsi pay now', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);
    $product  = orderProduct($admin->id);

    $this->actingAs($admin)->post(route('order.store'), [
        'customer_id'    => $customer->id,
        'items'          => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'pay_now'        => true,
        'payment_amount' => 15000,
        'payment_type'   => 'full',
    ]);

    $this->assertDatabaseHas('payments', [
        'amount' => 15000,
        'type'   => 'full',
        'status' => 'approved',
    ]);
});

// ─── INVOICE & PAYMENT TESTS ─────────────────────────────────────────────────

// TC-INV-001: Admin dapat menyetujui pembayaran
test('admin dapat menyetujui pembayaran yang pending', function () {
    $admin    = orderAdmin();
    $customer = orderCustomer($admin->id);
    $product  = orderProduct($admin->id);

    $order = Order::query()->create([
        'customer_id'    => $customer->id,
        'total_price'    => 15000,
        'checked_out_at' => now(),
        'created_by'     => $admin->id,
    ]);

    $invoice = Invoice::query()->create([
        'order_id'     => $order->id,
        'total_amount' => 15000,
        'created_by'   => $admin->id,
    ]);

    $payment = Payment::query()->create([
        'invoice_id' => $invoice->id,
        'amount'     => 15000,
        'type'       => 'full',
        'status'     => 'pending',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('invoice.payment.approve', $payment))
        ->assertRedirect();

    $payment->refresh();
    expect($payment->status)->toBe('approved');
});

// TC-INV-002: Admin dapat menolak pembayaran
test('admin dapat menolak pembayaran yang pending', function () {
    $admin   = orderAdmin();
    $product = orderProduct($admin->id);

    $order = Order::query()->create([
        'total_price'    => 15000,
        'checked_out_at' => now(),
        'created_by'     => $admin->id,
    ]);

    $invoice = Invoice::query()->create([
        'order_id'     => $order->id,
        'total_amount' => 15000,
        'created_by'   => $admin->id,
    ]);

    $payment = Payment::query()->create([
        'invoice_id' => $invoice->id,
        'amount'     => 15000,
        'type'       => 'full',
        'status'     => 'pending',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('invoice.payment.reject', $payment))
        ->assertRedirect();

    $payment->refresh();
    expect($payment->status)->toBe('rejected');
});

// TC-INV-003: Admin dapat menambahkan pembayaran langsung ke invoice
test('admin dapat menambahkan pembayaran langsung ke invoice', function () {
    $admin   = orderAdmin();
    $product = orderProduct($admin->id);

    $order = Order::query()->create([
        'total_price'    => 30000,
        'checked_out_at' => now(),
        'created_by'     => $admin->id,
    ]);

    $invoice = Invoice::query()->create([
        'order_id'     => $order->id,
        'total_amount' => 30000,
        'created_by'   => $admin->id,
    ]);

    $this->actingAs($admin)->post(route('invoice.payment.store', $invoice), [
        'amount' => 30000,
        'type'   => 'full',
    ])->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'invoice_id' => $invoice->id,
        'amount'     => 30000,
        'status'     => 'approved',
    ]);
});
