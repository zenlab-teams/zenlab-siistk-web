<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stock>
 */
class StockFactory extends Factory
{
    protected $model = Stock::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'quantity' => fake()->numberBetween(10, 200),
            'unit_cost' => fake()->randomElement([1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000]),
            'type' => 'in',
            'note' => 'Stok awal',
            'created_by' => 1,
        ];
    }

    public function stockOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => -abs(fake()->numberBetween(1, 20)),
            'type' => 'out',
            'unit_cost' => null,
            'note' => 'Penjualan',
        ]);
    }

    public function adjustment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'adjustment',
            'note' => 'Penyesuaian stok',
        ]);
    }
}
