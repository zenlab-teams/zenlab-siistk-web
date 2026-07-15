<?php

namespace Database\Factories;

use App\Models\Offer;
use App\Models\OfferSale;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OfferSale>
 */
class OfferSaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'offer_id' => Offer::factory(),
            'sale_id' => Sale::factory(),
            'notes' => fake()->optional(0.5)->sentence(),
            'created_by' => 1,
        ];
    }
}
