<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $customerUsers = User::where('role', 'customer')->get();

        // Customers linked to user accounts
        foreach ($customerUsers as $user) {
            Customer::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => fake()->numerify('08##########'),
                'email' => $user->email,
                'address' => fake()->address(),
                'created_by' => $admin->id,
            ]);
        }

        // Standalone customers (no user account)
        $standaloneNames = ['Toko Berkah Jaya', 'CV Maju Bersama', 'UD Sejahtera', 'PT Sinar Mas Kecil', 'Warung Barokah'];
        foreach ($standaloneNames as $name) {
            Customer::create([
                'name' => $name,
                'phone' => fake()->numerify('08##########'),
                'email' => fake()->optional(0.5)->safeEmail(),
                'address' => fake()->address(),
                'created_by' => $admin->id,
            ]);
        }
    }
}
