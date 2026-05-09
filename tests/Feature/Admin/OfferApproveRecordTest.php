<?php

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\OfferSale;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can approve a sale record and create an order with invoice', function () {
    $admin = User::query()->create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => 'password',
        'role' => 'admin',
    ]);

    $salesUser = User::query()->create([
        'name' => 'Sales User',
        'email' => 'sales@example.com',
        'password' => 'password',
        'role' => 'sales',
    ]);

    $sale = Sale::query()->create([
        'user_id' => $salesUser->id,
        'phone' => '08123456789',
        'created_by' => $admin->id,
    ]);

    $customer = Customer::query()->create([
        'name' => 'Customer A',
        'phone' => '08129876543',
        'email' => 'customer@example.com',
        'address' => 'Jl. Testing No. 1',
        'city' => 'Bandung',
        'postal_code' => '40111',
        'created_by' => $admin->id,
    ]);

    $product = Product::query()->create([
        'name' => 'Sample Product',
        'description' => 'Sample product for approval test',
        'price' => 15000,
        'created_by' => $admin->id,
    ]);

    $offer = Offer::query()->create([
        'name' => 'Weekly Offer',
        'description' => 'Offer for testing approval',
        'date' => now()->toDateString(),
        'created_by' => $admin->id,
    ]);

    OfferItem::query()->create([
        'offer_id' => $offer->id,
        'product_id' => $product->id,
        'quantity' => 5,
        'offered_price' => 12000,
        'subtotal' => 60000,
        'created_by' => $admin->id,
    ]);

    OfferSale::query()->create([
        'offer_id' => $offer->id,
        'sale_id' => $sale->id,
        'created_by' => $admin->id,
    ]);

    $record = OfferRecord::query()->create([
        'offer_id' => $offer->id,
        'sale_id' => $sale->id,
        'customer_id' => $customer->id,
        'status' => 'pending',
        'notes' => 'Testing approval flow',
        'created_by' => $salesUser->id,
    ]);

    OfferRecordItem::query()->create([
        'offer_record_id' => $record->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'sold_price' => 13000,
        'subtotal' => 26000,
        'created_by' => $salesUser->id,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('offer.record.approve', [$offer, $record]));

    $order = Order::query()->with(['invoice', 'items'])->firstOrFail();

    $response->assertRedirect(route('order.show', $order));

    expect($order->offer_record_id)->toBe($record->id);
    expect($order->checked_out_at)->not->toBeNull();
    expect($order->total_price)->toBe(26000);
    expect($order->invoice)->toBeInstanceOf(Invoice::class);
    expect($order->invoice?->total_amount)->toBe(26000);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first())->toBeInstanceOf(OrderItem::class);
    expect($order->items->first()?->price)->toBe(13000);
});