<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferRecord;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OfferRecord>
 */
class OfferRecordFactory extends Factory
{
    protected $model = OfferRecord::class;

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
            'customer_id' => Customer::factory(),
            'status' => 'pending',
            'notes' => fake()->optional(0.5)->sentence(),
            'created_by' => 1,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => 'rejected']);
    }
}
