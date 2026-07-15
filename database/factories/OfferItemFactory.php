<?php

namespace Database\Factories;

use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OfferItem>
 */
class OfferItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(5, 50);
        $price = fake()->randomElement([5000, 8000, 10000, 15000, 20000, 25000]);

        return [
            'offer_id' => Offer::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'offered_price' => $price,
            'subtotal' => $quantity * $price,
            'created_by' => 1,
        ];
    }
}
