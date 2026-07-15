<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class OrderSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $customers = Customer::all();
        $products = Product::all();

        // Completed orders (10) - spread over last 3 months
        for ($i = 0; $i < 10; $i++) {
            $createdAt = Carbon::now()->subDays(fake()->numberBetween(1, 90));
            $customer = $customers->random();

            $order = Order::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'customer_id' => $customer->id,
                'total_price' => 0,
                'checked_out_at' => $createdAt->copy()->addHours(fake()->numberBetween(1, 48)),
                'created_by' => $admin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->createOrderItems($order, $products, $admin->id);

            // Manually deduct stock for completed orders
            foreach ($order->fresh()->items as $item) {
                Stock::create([
                    'product_id' => $item->product_id,
                    'quantity' => -$item->quantity,
                    'type' => 'out',
                    'reference_type' => 'order',
                    'note' => "Order #{$order->id} checkout",
                    'created_by' => $admin->id,
                ]);
            }
        }

        // Pending orders (4)
        for ($i = 0; $i < 4; $i++) {
            $createdAt = Carbon::now()->subDays(fake()->numberBetween(0, 7));
            $customer = $customers->random();

            $order = Order::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'customer_id' => $customer->id,
                'total_price' => 0,
                'created_by' => $admin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->createOrderItems($order, $products, $admin->id);
        }

        // Cancelled orders (3)
        for ($i = 0; $i < 3; $i++) {
            $createdAt = Carbon::now()->subDays(fake()->numberBetween(5, 60));
            $customer = $customers->random();

            $order = Order::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'customer_id' => $customer->id,
                'total_price' => 0,
                'cancelled_at' => $createdAt->copy()->addDays(fake()->numberBetween(1, 3)),
                'created_by' => $admin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->createOrderItems($order, $products, $admin->id);
        }

        // Expired orders (3)
        for ($i = 0; $i < 3; $i++) {
            $createdAt = Carbon::now()->subDays(fake()->numberBetween(10, 60));
            $customer = $customers->random();

            $order = Order::create([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'customer_id' => $customer->id,
                'total_price' => 0,
                'expired_at' => $createdAt->copy()->addDays(fake()->numberBetween(7, 14)),
                'created_by' => $admin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->createOrderItems($order, $products, $admin->id);
        }
    }

    private function createOrderItems(Order $order, $products, int $createdBy): void
    {
        $itemCount = fake()->numberBetween(1, 4);
        $selectedProducts = $products->random($itemCount);
        $totalPrice = 0;

        foreach ($selectedProducts as $product) {
            $qty = fake()->numberBetween(1, 8);
            $subtotal = $qty * $product->price;
            $totalPrice += $subtotal;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $qty,
                'price' => $product->price,
                'subtotal' => $subtotal,
                'created_by' => $createdBy,
            ]);
        }

        $order->update(['total_price' => $totalPrice]);
    }
}
