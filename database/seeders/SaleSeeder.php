<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\SalesTarget;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $salesUsers = User::where('role', 'sales')->get();
        $admin = User::where('role', 'admin')->first();

        foreach ($salesUsers as $user) {
            $sale = Sale::create([
                'user_id' => $user->id,
                'phone' => fake()->numerify('08##########'),
                'created_by' => $admin->id,
            ]);

            // Sales target for last month
            SalesTarget::create([
                'sales_id' => $sale->id,
                'target_amount' => fake()->randomElement([1000000, 1500000, 2000000, 2500000, 3000000]),
                'start' => Carbon::now()->subMonth()->startOfMonth(),
                'end' => Carbon::now()->subMonth()->endOfMonth(),
                'created_by' => $admin->id,
            ]);

            // Sales target for this month
            SalesTarget::create([
                'sales_id' => $sale->id,
                'target_amount' => fake()->randomElement([1500000, 2000000, 2500000, 3000000, 5000000]),
                'start' => Carbon::now()->startOfMonth(),
                'end' => Carbon::now()->endOfMonth(),
                'created_by' => $admin->id,
            ]);
        }
    }
}
