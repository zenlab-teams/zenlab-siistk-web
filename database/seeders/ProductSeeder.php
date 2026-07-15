<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Database\Seeders\Helpers\ImageGenerator;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $products = [
            ['name' => 'Semen Tiga Roda 50kg', 'price' => 65000,  'minimum' => 15,  'description' => 'Semen Portland berkualitas tinggi untuk plesteran dan beton'],
            ['name' => 'Semen Padang 50kg',    'price' => 62000,  'minimum' => 15,  'description' => 'Semen Portland Padang berkualitas tinggi'],
            ['name' => 'Pasir Beton (m3)',      'price' => 250000, 'minimum' => 5,   'description' => 'Pasir beton bersih berkualitas tinggi per kubik'],
            ['name' => 'Bata Merah (pcs)',      'price' => 1000,   'minimum' => 100, 'description' => 'Bata merah oven berkualitas tinggi per pcs'],
            ['name' => 'Baja Ringan C75',       'price' => 85000,  'minimum' => 20,  'description' => 'Baja ringan tipe C75 tebal 0.75mm untuk rangka atap'],
            ['name' => 'Besi Beton 10mm',       'price' => 75000,  'minimum' => 15,  'description' => 'Besi beton ulir diameter 10mm SNI panjang 12m'],
            ['name' => 'Besi Beton 8mm',        'price' => 48000,  'minimum' => 15,  'description' => 'Besi beton polos diameter 8mm SNI panjang 12m'],
            ['name' => 'Paku Kayu 3 inch',      'price' => 18000,  'minimum' => 10,  'description' => 'Paku kayu ukuran 3 inch per kg'],
            ['name' => 'Cat Tembok Dulux 5kg',  'price' => 240000, 'minimum' => 5,   'description' => 'Cat tembok premium interior merk Dulux 5kg'],
            ['name' => 'Cat Tembok Avitex 5kg', 'price' => 115000, 'minimum' => 5,   'description' => 'Cat tembok interior merk Avitex 5kg'],
            ['name' => 'Triplek 9mm',           'price' => 85000,  'minimum' => 10,  'description' => 'Lembar triplek tebal 9mm ukuran standar 122x244'],
            ['name' => 'Triplek 12mm',          'price' => 125000, 'minimum' => 10,  'description' => 'Lembar triplek tebal 12mm ukuran standar 122x244'],
            ['name' => 'Pipa PVC Rucika 3 inch','price' => 95000,  'minimum' => 8,   'description' => 'Pipa PVC kelas D merk Rucika ukuran 3 inch panjang 4m'],
            ['name' => 'Kawat Bendrat (kg)',    'price' => 22000,  'minimum' => 15,  'description' => 'Kawat bendrat ikat besi beton per kg'],
            ['name' => 'Keramik Milan 40x40',   'price' => 68000,  'minimum' => 12,  'description' => 'Keramik lantai Milan ukuran 40x40 per dus'],
            ['name' => 'Genteng Beton (pcs)',   'price' => 8500,   'minimum' => 100, 'description' => 'Genteng beton flat berkualitas tinggi per pcs'],
            ['name' => 'Grc Board 4mm',         'price' => 60000,  'minimum' => 10,  'description' => 'Papan semen GRC board tebal 4mm ukuran 122x244'],
            ['name' => 'Asbes Gelombang',       'price' => 53000,  'minimum' => 10,  'description' => 'Asbes gelombang mini tebal 4mm panjang 1.8m'],
            ['name' => 'Semen Putih (kg)',      'price' => 12000,  'minimum' => 20,  'description' => 'Semen putih premium untuk plamir dan celah keramik per kg'],
            ['name' => 'Toren Air Penguin 650L','price' => 950000, 'minimum' => 2,   'description' => 'Tangki air/toren Penguin kapasitas 650 liter anti lumut'],
        ];

        foreach ($products as $i => $data) {
            // Generate thumbnail image
            $thumbnail = ImageGenerator::generateProductThumbnail($data['name'], $i);

            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'thumbnail' => $thumbnail,
                'price' => $data['price'],
                'minimum' => $data['minimum'],
                'created_by' => $admin->id,
            ]);

            // Create initial stock (type=in)
            Stock::create([
                'product_id' => $product->id,
                'quantity' => fake()->numberBetween(80, 200),
                'unit_cost' => (int) ($data['price'] * 0.6), // 60% of sell price
                'type' => 'in',
                'note' => 'Stok awal',
                'created_by' => $admin->id,
            ]);
        }
    }
}
