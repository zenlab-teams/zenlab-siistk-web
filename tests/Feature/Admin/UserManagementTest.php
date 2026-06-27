<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ────────────────────────────────────────────────────────────────

function userAdmin(): User
{
    return User::query()->create([
        'name' => 'Admin', 'email' => 'admin@user.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);
}

// ─── USER MANAGEMENT TESTS ───────────────────────────────────────────────────

// TC-USER-001: Admin dapat mengakses daftar pengguna
test('admin dapat mengakses halaman daftar pengguna', function () {
    $admin = userAdmin();
    $this->actingAs($admin)->get(route('user.index'))->assertOk();
});

// TC-USER-002: Role sales tidak dapat mengakses halaman manajemen user
test('role sales tidak dapat mengakses halaman manajemen user', function () {
    $sales = User::query()->create([
        'name' => 'Sales', 'email' => 'sales@user.com',
        'password' => bcrypt('pass'), 'role' => 'sales',
    ]);
    $this->actingAs($sales)->get(route('user.index'))->assertForbidden();
});

// TC-USER-003: Admin dapat membuat pengguna baru dengan role admin
test('admin dapat membuat pengguna baru dengan role admin', function () {
    $admin = userAdmin();

    $response = $this->actingAs($admin)->post(route('user.store'), [
        'name'                  => 'User Baru',
        'email'                 => 'userbaru@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'admin',
    ]);

    $response->assertRedirect(route('user.index'));
    $this->assertDatabaseHas('users', [
        'email' => 'userbaru@test.com',
        'role'  => 'admin',
    ]);
});

// TC-USER-004: Admin dapat membuat pengguna dengan role sales
test('admin dapat membuat pengguna dengan role sales dan data profile', function () {
    $admin = userAdmin();

    $response = $this->actingAs($admin)->post(route('user.store'), [
        'name'                  => 'Sales Baru',
        'email'                 => 'salesbaru@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'sales',
        'phone'                 => '08123456789',
    ]);

    $response->assertRedirect(route('user.index'));
    $this->assertDatabaseHas('users', ['email' => 'salesbaru@test.com', 'role' => 'sales']);
    $this->assertDatabaseHas('sales', ['phone' => '08123456789']);
});

// TC-USER-005: Pembuatan user gagal jika email duplikat
test('pembuatan pengguna gagal jika email sudah terdaftar', function () {
    $admin = userAdmin();
    User::query()->create([
        'name' => 'Existing', 'email' => 'exist@test.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->post(route('user.store'), [
        'name'                  => 'Duplikat',
        'email'                 => 'exist@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'admin',
    ]);

    $response->assertSessionHasErrors('email');
});

// TC-USER-006: Pembuatan user gagal jika password tidak cocok
test('pembuatan pengguna gagal jika konfirmasi password tidak cocok', function () {
    $admin = userAdmin();

    $response = $this->actingAs($admin)->post(route('user.store'), [
        'name'                  => 'User Baru',
        'email'                 => 'new@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'wrongpassword',
        'role'                  => 'admin',
    ]);

    $response->assertSessionHasErrors('password');
});

// TC-USER-007: Admin dapat mengedit pengguna lain
test('admin dapat memperbarui data pengguna lain', function () {
    $admin  = userAdmin();
    $target = User::query()->create([
        'name' => 'Target User', 'email' => 'target@test.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->put(route('user.update', $target), [
        'name'  => 'Target Diperbarui',
        'email' => 'target@test.com',
        'role'  => 'admin',
    ]);

    $response->assertRedirect(route('user.index'));
    $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Target Diperbarui']);
});

// TC-USER-008: Admin tidak dapat mengubah role dirinya sendiri
test('admin tidak dapat mengubah role dirinya sendiri', function () {
    $admin = userAdmin();

    $response = $this->actingAs($admin)->put(route('user.update', $admin), [
        'name'  => 'Admin',
        'email' => 'admin@user.com',
        'role'  => 'sales', // Mencoba ubah role sendiri
    ]);

    $response->assertSessionHas('error');
    $admin->refresh();
    expect($admin->role)->toBe('admin'); // Role tidak berubah
});

// TC-USER-009: Admin dapat menghapus pengguna lain
test('admin dapat menghapus pengguna lain', function () {
    $admin  = userAdmin();
    $target = User::query()->create([
        'name' => 'Target Hapus', 'email' => 'hapus@test.com',
        'password' => bcrypt('pass'), 'role' => 'admin',
    ]);

    $this->actingAs($admin)->delete(route('user.destroy', $target))
        ->assertRedirect(route('user.index'));

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

// TC-USER-010: Admin tidak dapat menghapus akunnya sendiri
test('admin tidak dapat menghapus akun dirinya sendiri', function () {
    $admin = userAdmin();

    $this->actingAs($admin)->delete(route('user.destroy', $admin))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

// TC-USER-011: Admin dapat menghapus beberapa pengguna sekaligus
test('admin dapat menghapus beberapa pengguna sekaligus', function () {
    $admin   = userAdmin();
    $target1 = User::query()->create([
        'name' => 'T1', 'email' => 't1@test.com',
        'password' => bcrypt('pass'), 'role' => 'sales',
    ]);
    $target2 = User::query()->create([
        'name' => 'T2', 'email' => 't2@test.com',
        'password' => bcrypt('pass'), 'role' => 'sales',
    ]);

    $this->actingAs($admin)
        ->delete(route('user.destroySelected', ['ids' => "{$target1->id},{$target2->id}"]))
        ->assertRedirect(route('user.index'));

    $this->assertDatabaseMissing('users', ['id' => $target1->id]);
    $this->assertDatabaseMissing('users', ['id' => $target2->id]);
});

// TC-USER-012: Admin tidak dapat menghapus beberapa pengguna jika termasuk dirinya
test('admin tidak dapat menghapus dirinya sendiri dalam bulk delete', function () {
    $admin = userAdmin();
    $other = User::query()->create([
        'name' => 'Other', 'email' => 'other@test.com',
        'password' => bcrypt('pass'), 'role' => 'sales',
    ]);

    $this->actingAs($admin)
        ->delete(route('user.destroySelected', ['ids' => "{$admin->id},{$other->id}"]))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

// TC-USER-013: Halaman dashboard hanya dapat diakses oleh admin
test('halaman dashboard admin hanya dapat diakses oleh admin', function () {
    $admin = userAdmin();
    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
});
