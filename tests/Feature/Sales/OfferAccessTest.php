<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('sales users without a sale profile receive a forbidden response on offers', function () {
    $salesUser = User::query()->create([
        'name' => 'Sales User',
        'email' => 'sales@example.com',
        'password' => 'password',
        'role' => 'sales',
    ]);

    $this->actingAs($salesUser)
        ->get(route('sales.offer.index'))
        ->assertForbidden();
});
