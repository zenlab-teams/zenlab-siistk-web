<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        
        \App\Models\User::truncate();
        \App\Models\Customer::truncate();
        \App\Models\Product::truncate();
        \App\Models\Stock::truncate();
        \App\Models\Offer::truncate();
        \Illuminate\Support\Facades\DB::table('offers_items')->truncate();
        \Illuminate\Support\Facades\DB::table('offers_sales')->truncate();
        \App\Models\OfferRecord::truncate();
        \Illuminate\Support\Facades\DB::table('offers_record_items')->truncate();
        \App\Models\Order::truncate();
        \Illuminate\Support\Facades\DB::table('orders_items')->truncate();
        \App\Models\Invoice::truncate();
        \App\Models\Payment::truncate();
        \App\Models\Sale::truncate();
        \Illuminate\Support\Facades\DB::table('sales_targets')->truncate();

        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            SaleSeeder::class,
            CustomerSeeder::class,
            ProductSeeder::class,
            OfferSeeder::class,
            OrderSeeder::class,
            InvoicePaymentSeeder::class,
        ]);
    }
}
