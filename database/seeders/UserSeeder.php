<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin users
        User::factory()->admin()->create([
            'name' => 'Admin TelatenKarya',
            'email' => 'admin@zenlab.dev',
        ]);
        User::factory()->admin()->create([
            'name' => 'Admin Dua',
            'email' => 'admin2@zenlab.dev',
        ]);
        User::factory()->admin()->create([
            'name' => 'Admin Tiga',
            'email' => 'admin3@zenlab.dev',
        ]);

        // Sales users
        $salesNames = ['Budi Santoso', 'Siti Rahayu', 'Ahmad Fadli', 'Dewi Lestari', 'Rizky Pratama'];
        foreach ($salesNames as $i => $name) {
            User::factory()->sales()->create([
                'name' => $name,
                'email' => 'sales' . ($i + 1) . '@zenlab.dev',
            ]);
        }
    }
}
