<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@zenlab.dev',
            'password' => 'password',
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Sales User',
            'email' => 'sales@zenlab.dev',
            'password' => 'password',
            'role' => 'sales',
        ]);

        User::create([
            'name' => 'Customer User',
            'email' => 'customer@zenlab.dev',
            'password' => 'password',
            'role' => 'customer',
        ]);
    }
}
