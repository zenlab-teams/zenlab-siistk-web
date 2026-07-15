<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'total_amount' => fake()->numberBetween(10000, 500000),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
            'notes' => fake()->optional(0.5)->sentence(),
            'created_by' => 1,
        ];
    }
}
