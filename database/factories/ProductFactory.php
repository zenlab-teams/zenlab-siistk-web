<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Semen Tiga Roda 50kg', 'Semen Padang 50kg', 'Pasir Beton (m3)', 'Bata Merah (pcs)', 'Baja Ringan C75',
                'Besi Beton 10mm', 'Besi Beton 8mm', 'Paku Kayu 3 inch', 'Cat Tembok Dulux 5kg', 'Cat Tembok Avitex 5kg',
                'Triplek 9mm', 'Triplek 12mm', 'Pipa PVC Rucika 3 inch', 'Kawat Bendrat (kg)', 'Keramik Milan 40x40',
                'Genteng Beton (pcs)', 'Grc Board 4mm', 'Asbes Gelombang', 'Semen Putih (kg)', 'Plamir Tembok 5kg',
                'Kuas Cat 3 inch', 'Thinner Impala 1L', 'Toren Air Penguin 650L', 'Baja Ringan Reng', 'Glass Block (pcs)',
            ]),
            'description' => fake()->sentence(8),
            'price' => fake()->randomElement([15000, 25000, 45000, 65000, 85000, 120000, 150000, 250000, 500000, 950000]),
            'minimum' => fake()->numberBetween(3, 15),
            'created_by' => 1,
        ];
    }
}
