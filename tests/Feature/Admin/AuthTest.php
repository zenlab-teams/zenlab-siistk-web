<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// TC-AUTH-001: Login dengan kredensial valid (admin)
test('admin dapat login dengan kredensial yang valid', function () {
    $admin = User::query()->create([
        'name'     => 'Admin Test',
        'email'    => 'admin@test.com',
        'password' => bcrypt('password123'),
        'role'     => 'admin',
    ]);

    $response = $this->post('/login', [
        'email'    => 'admin@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('admin.dashboard'));
    $this->assertAuthenticatedAs($admin);
});

// TC-AUTH-002: Login dengan kredensial valid (sales)
test('sales dapat login dengan kredensial yang valid', function () {
    $sales = User::query()->create([
        'name'     => 'Sales Test',
        'email'    => 'sales@test.com',
        'password' => bcrypt('password123'),
        'role'     => 'sales',
    ]);

    $response = $this->post('/login', [
        'email'    => 'sales@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('sales.dashboard'));
    $this->assertAuthenticatedAs($sales);
});

// TC-AUTH-003: Login dengan kredensial valid (customer)
test('customer dapat login dengan kredensial yang valid', function () {
    $customer = User::query()->create([
        'name'     => 'Customer Test',
        'email'    => 'customer@test.com',
        'password' => bcrypt('password123'),
        'role'     => 'customer',
    ]);

    $response = $this->post('/login', [
        'email'    => 'customer@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('customer.dashboard'));
    $this->assertAuthenticatedAs($customer);
});

// TC-AUTH-004: Login dengan password salah
test('login gagal jika password salah', function () {
    User::query()->create([
        'name'     => 'Admin Test',
        'email'    => 'admin@test.com',
        'password' => bcrypt('password123'),
        'role'     => 'admin',
    ]);

    $response = $this->post('/login', [
        'email'    => 'admin@test.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

// TC-AUTH-005: Login dengan email tidak terdaftar
test('login gagal jika email tidak terdaftar', function () {
    $response = $this->post('/login', [
        'email'    => 'notfound@test.com',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

// TC-AUTH-006: Login dengan field email kosong
test('login gagal jika field email kosong', function () {
    $response = $this->post('/login', [
        'email'    => '',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

// TC-AUTH-007: Login dengan format email tidak valid
test('login gagal jika format email tidak valid', function () {
    $response = $this->post('/login', [
        'email'    => 'bukan-email',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

// TC-AUTH-008: Logout berhasil
test('user yang login dapat melakukan logout', function () {
    $admin = User::query()->create([
        'name'     => 'Admin Test',
        'email'    => 'admin@test.com',
        'password' => bcrypt('password123'),
        'role'     => 'admin',
    ]);

    $this->actingAs($admin)->post('/logout')
        ->assertRedirect('/login');

    $this->assertGuest();
});

// TC-AUTH-009: Guest tidak dapat mengakses halaman admin
test('guest diredirect ke login jika mengakses halaman admin', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

// TC-AUTH-010: Halaman login dapat diakses oleh guest
test('halaman login dapat diakses tanpa autentikasi', function () {
    $this->get('/login')->assertStatus(200);
});
