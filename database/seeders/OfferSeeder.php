<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\OfferRecord;
use App\Models\OfferRecordItem;
use App\Models\OfferSale;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $sales = Sale::all();
        $products = Product::all();
        $customers = Customer::all();

        $offerData = [
            ['name' => 'Bazar Ramadhan 2026',       'status' => 'completed', 'date' => Carbon::now()->subMonths(2)->subDays(10)],
            ['name' => 'Pameran UMKM Bandung',      'status' => 'completed', 'date' => Carbon::now()->subMonth()->subDays(5)],
            ['name' => 'Expo Kuliner Jakarta',       'status' => 'active',    'date' => Carbon::now()->subDays(3)],
            ['name' => 'Festival Kopi Nusantara',    'status' => 'active',    'date' => Carbon::now()->addDays(7)],
            ['name' => 'Sunday Market Solo',         'status' => 'rejected',  'date' => Carbon::now()->subMonth()->subDays(15)],
        ];

        $locations = ['Jakarta Selatan', 'Bandung', 'Surabaya', 'Yogyakarta', 'Solo'];

        foreach ($offerData as $i => $data) {
            $offer = Offer::create([
                'name' => $data['name'],
                'description' => fake()->sentence(10),
                'date' => $data['date'],
                'location' => $locations[$i],
                'latitude' => fake()->latitude(-8.0, -6.5),
                'longitude' => fake()->longitude(106.5, 112.5),
                'completed_at' => $data['status'] === 'completed' ? $data['date']->copy()->addDays(1) : null,
                'rejected_at' => $data['status'] === 'rejected' ? $data['date']->copy()->addDays(1) : null,
                'created_by' => $admin->id,
            ]);

            // Create 3-5 offer items
            $itemCount = fake()->numberBetween(3, 5);
            $selectedProducts = $products->random($itemCount);

            foreach ($selectedProducts as $product) {
                $qty = fake()->numberBetween(10, 40);
                OfferItem::create([
                    'offer_id' => $offer->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'offered_price' => $product->price,
                    'subtotal' => $qty * $product->price,
                    'created_by' => $admin->id,
                ]);

                // Manually create stock-out for offer items (since observer may not catch items created after offer)
                Stock::create([
                    'product_id' => $product->id,
                    'quantity' => -$qty,
                    'type' => 'out',
                    'reference_id' => $offer->id,
                    'reference_type' => Offer::class,
                    'note' => "Ngampas: {$offer->name}",
                    'created_by' => $admin->id,
                ]);
            }

            // Assign 1-3 sales to this offer
            $assignedSales = $sales->random(min($sales->count(), fake()->numberBetween(1, 3)));
            foreach ($assignedSales as $sale) {
                OfferSale::create([
                    'offer_id' => $offer->id,
                    'sale_id' => $sale->id,
                    'notes' => fake()->optional(0.4)->sentence(),
                    'created_by' => $admin->id,
                ]);
            }

            // For completed offers, create approved records
            if ($data['status'] === 'completed') {
                $recordCount = fake()->numberBetween(2, 4);
                for ($r = 0; $r < $recordCount; $r++) {
                    $sale = $assignedSales->random();
                    $customer = $customers->random();

                    $record = OfferRecord::create([
                        'offer_id' => $offer->id,
                        'sale_id' => $sale->id,
                        'customer_id' => $customer->id,
                        'status' => 'approved',
                        'notes' => fake()->optional(0.5)->sentence(),
                        'created_by' => $admin->id,
                    ]);

                    // Record items (subset of offer products)
                    $recordProducts = $selectedProducts->random(fake()->numberBetween(1, min(3, $selectedProducts->count())));
                    foreach ($recordProducts as $product) {
                        $qty = fake()->numberBetween(1, 5);
                        OfferRecordItem::create([
                            'offer_record_id' => $record->id,
                            'product_id' => $product->id,
                            'quantity' => $qty,
                            'sold_price' => $product->price,
                            'subtotal' => $qty * $product->price,
                            'created_by' => $admin->id,
                        ]);
                    }
                }
            }
        }
    }
}
