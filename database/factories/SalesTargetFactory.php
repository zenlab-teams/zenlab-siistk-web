<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\SalesTarget;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesTarget>
 */
class SalesTargetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sales_id' => Sale::factory(),
            'target_amount' => fake()->randomElement([500000, 1000000, 1500000, 2000000, 2500000, 3000000, 5000000]),
            'start' => $start = fake()->dateTimeBetween('-3 months', 'now'),
            'end' => Carbon::parse($start)->endOfMonth(),
            'created_by' => 1,
        ];
    }
}
