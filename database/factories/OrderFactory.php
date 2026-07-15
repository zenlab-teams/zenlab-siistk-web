<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'customer_id' => Customer::factory(),
            'total_price' => 0,
            'created_by' => 1,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'checked_out_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'cancelled_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expired_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ]);
    }
}
