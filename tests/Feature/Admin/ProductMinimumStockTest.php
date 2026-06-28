<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::query()->create([
        'name' => 'Admin User',
        'email' => 'admin-minimum@example.com',
        'password' => 'password',
        'role' => 'admin',
    ]);
});

test('admin can create a product without minimum stock', function () {
    $response = $this->actingAs($this->admin)->post(route('product.store'), [
        'name' => 'Product Without Minimum',
        'price' => 12000,
        'description' => 'Minimum stock is optional',
    ]);

    $response->assertRedirect(route('product.index'));

    $product = Product::query()
        ->where('name', 'Product Without Minimum')
        ->firstOrFail();

    expect($product->minimum)->toBeNull();
});

test('admin can store minimum stock from the create form and expose it in stock summaries', function () {
    $response = $this->actingAs($this->admin)->post(route('product.store'), [
        'name' => 'Critical Product',
        'price' => 15000,
        'minimum' => 7,
        'description' => 'Critical when stock is under minimum',
    ]);

    $response->assertRedirect(route('product.index'));

    $product = Product::query()
        ->where('name', 'Critical Product')
        ->firstOrFail();

    $product->stocks()->create([
        'quantity' => 3,
        'unit_cost' => 8000,
        'type' => 'in',
        'note' => 'Initial stock',
        'created_by' => $this->admin->id,
    ]);

    $summaries = Product::query()
        ->select(['id', 'name', 'minimum'])
        ->withSum('stocks', 'quantity')
        ->where('name', 'Critical Product')
        ->get();

    expect($summaries)->toHaveCount(1);
    expect($summaries->first()?->minimum)->toBe(7);
    expect($summaries->first()?->stocks_sum_quantity)->toBe(3);
});

test('admin can update minimum stock from the edit form', function () {
    $product = Product::query()->create([
        'name' => 'Editable Product',
        'price' => 20000,
        'description' => 'Before update',
        'created_by' => $this->admin->id,
    ]);

    $response = $this->actingAs($this->admin)->post(route('product.update', $product), [
        '_method' => 'PUT',
        'name' => 'Editable Product',
        'price' => 20000,
        'minimum' => 9,
        'description' => 'After update',
        'stock_quantity' => null,
        'stock_type' => 'in',
        'stock_unit_cost' => null,
        'stock_note' => null,
    ]);

    $response->assertRedirect(route('product.index'));

    $product->refresh();

    expect($product->minimum)->toBe(9);
});

test('admin can store minimum stock from bulk create', function () {
    $response = $this->actingAs($this->admin)->post(route('product.bulkStore'), [
        'products' => [
            [
                'name' => 'Bulk Product A',
                'price' => 10000,
                'description' => 'First bulk product',
                'minimum' => null,
            ],
            [
                'name' => 'Bulk Product B',
                'price' => 25000,
                'description' => 'Second bulk product',
                'minimum' => 4,
            ],
        ],
    ]);

    $response->assertRedirect(route('product.index'));

    expect(Product::query()->where('name', 'Bulk Product A')->firstOrFail()->minimum)->toBeNull();
    expect(Product::query()->where('name', 'Bulk Product B')->firstOrFail()->minimum)->toBe(4);
});

test('dashboard only lists products that are below their own minimum stock', function () {
    $criticalProduct = Product::query()->create([
        'name' => 'Critical Dashboard Product',
        'price' => 30000,
        'minimum' => 5,
        'created_by' => $this->admin->id,
    ]);
    $criticalProduct->stocks()->create([
        'quantity' => 3,
        'unit_cost' => 12000,
        'type' => 'in',
        'note' => 'Critical stock',
        'created_by' => $this->admin->id,
    ]);

    $noMinimumProduct = Product::query()->create([
        'name' => 'No Minimum Product',
        'price' => 18000,
        'created_by' => $this->admin->id,
    ]);
    $noMinimumProduct->stocks()->create([
        'quantity' => 1,
        'unit_cost' => 9000,
        'type' => 'in',
        'note' => 'Low stock but no threshold',
        'created_by' => $this->admin->id,
    ]);

    $healthyProduct = Product::query()->create([
        'name' => 'Healthy Product',
        'price' => 22000,
        'minimum' => 5,
        'created_by' => $this->admin->id,
    ]);
    $healthyProduct->stocks()->create([
        'quantity' => 7,
        'unit_cost' => 15000,
        'type' => 'in',
        'note' => 'Healthy stock',
        'created_by' => $this->admin->id,
    ]);

    $lowStockProducts = Product::query()
        ->select(['id', 'name', 'thumbnail', 'minimum'])
        ->whereNotNull('minimum')
        ->withSum('stocks', 'quantity')
        ->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM stocks WHERE stocks.product_id = products.id) < minimum')
        ->orderByRaw('COALESCE(stocks_sum_quantity, 0)')
        ->get();

    expect($lowStockProducts)->toHaveCount(1);
    expect($lowStockProducts->first()?->name)->toBe('Critical Dashboard Product');
    expect($lowStockProducts->first()?->minimum)->toBe(5);
    expect($lowStockProducts->first()?->stocks_sum_quantity)->toBe(3);
});
