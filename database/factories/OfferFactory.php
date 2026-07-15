<?php

namespace Database\Factories;

use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $eventNames = ['Bazar Ramadhan', 'Pameran UMKM', 'Expo Kuliner', 'Festival Kopi Nusantara', 'Pasar Malam Minggu',
                       'Bazar Kampus', 'Food Fest Weekend', 'Pameran Produk Lokal', 'Sunday Market', 'Weekend Fair'];
        $locations = ['Jakarta Selatan', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Solo', 'Medan', 'Makassar', 'Denpasar'];

        return [
            'name' => fake()->randomElement($eventNames) . ' ' . fake()->year(),
            'description' => fake()->sentence(10),
            'date' => fake()->dateTimeBetween('-3 months', '+1 month'),
            'location' => fake()->randomElement($locations),
            'latitude' => fake()->latitude(-8.5, -6.0),
            'longitude' => fake()->longitude(106.0, 113.0),
            'created_by' => 1,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'rejected_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ]);
    }
}
