<?php

namespace Database\Factories;

use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OfferRecordItem>
 */
class OfferRecordItemFactory extends Factory
{
    protected $model = OfferRecordItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 20);
        $price = fake()->randomElement([5000, 8000, 10000, 15000, 20000, 25000, 30000]);

        return [
            'offer_record_id' => OfferRecord::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'sold_price' => $price,
            'subtotal' => $quantity * $price,
            'created_by' => 1,
        ];
    }
}
