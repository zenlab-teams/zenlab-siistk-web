<?php

use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\ActionableChatbotService;

uses(RefreshDatabase::class);

// Helpers to create users with different roles
function chatbotUserAdmin(): User
{
    return User::query()->create([
        'name' => 'Admin User',
        'email' => 'admin.chatbot@user.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);
}

function chatbotUserSales(): User
{
    return User::query()->create([
        'name' => 'Sales User',
        'email' => 'sales.chatbot@user.com',
        'password' => bcrypt('password'),
        'role' => 'sales',
    ]);
}

test('admin dapat mengakses endpoint pesan chatbot', function () {
    // Mock the service to avoid calling actual NVIDIA NIM API
    $mockService = Mockery::mock(ActionableChatbotService::class);
    $mockService->shouldReceive('handle')
        ->once()
        ->with('Halo', [], null, null)
        ->andReturn(['reply' => 'Halo Admin!', 'meta' => ['intent' => 'general']]);

    $this->instance(ActionableChatbotService::class, $mockService);

    $admin = chatbotUserAdmin();
    $response = $this->actingAs($admin)->postJson(route('admin.chatbot.messages'), [
        'message' => 'Halo',
        'history' => []
    ]);

    $response->assertOk();
    $response->assertJsonPath('reply', 'Halo Admin!');
});

test('non-admin tidak dapat mengakses endpoint pesan chatbot', function () {
    $sales = chatbotUserSales();
    $response = $this->actingAs($sales)->postJson(route('admin.chatbot.messages'), [
        'message' => 'Halo'
    ]);

    $response->assertStatus(403);
});

test('admin dapat mengunggah gambar sementara', function () {
    Storage::fake('public');
    
    $admin = chatbotUserAdmin();
    $file = UploadedFile::fake()->image('temp_product.jpg');

    $response = $this->actingAs($admin)->postJson(route('admin.chatbot.upload-temp'), [
        'image' => $file
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure(['temp_path', 'temp_url']);
    
    $path = $response->json('temp_path');
    Storage::disk('public')->assertExists($path);
});

test('non-admin tidak dapat mengunggah gambar sementara', function () {
    Storage::fake('public');

    $sales = chatbotUserSales();
    $file = UploadedFile::fake()->image('temp_product.jpg');

    $response = $this->actingAs($sales)->postJson(route('admin.chatbot.upload-temp'), [
        'image' => $file
    ]);

    $response->assertStatus(403);
});

test('scheduler pembersihan gambar sementara menghapus file lama', function () {
    Storage::fake('public');

    // Create a new temp file
    $newFile = 'temp-chatbot/new.jpg';
    Storage::disk('public')->put($newFile, 'content');

    // Create an old temp file
    $oldFile = 'temp-chatbot/old.jpg';
    Storage::disk('public')->put($oldFile, 'content');

    // Manipulate time: touch file to set modified time to 48 hours ago
    $oldFilePath = Storage::disk('public')->path($oldFile);
    touch($oldFilePath, time() - (48 * 3600));

    // Run command
    $this->artisan('chatbot:clean-temp')
        ->expectsOutput('Cleaned up 1 temporary files.')
        ->assertExitCode(0);

    Storage::disk('public')->assertExists($newFile);
    Storage::disk('public')->assertMissing($oldFile);
});

test('service chatbot memproses aksi add_product secara transaksi aman', function () {
    Storage::fake('public');

    $admin = chatbotUserAdmin();
    $this->actingAs($admin);

    // Setup a temp file
    $tempPath = 'temp-chatbot/fake_product.jpg';
    Storage::disk('public')->put($tempPath, 'fake-image-content');

    $service = new ActionableChatbotService();

    // Invoke protected executeWriteAction method via reflection
    $reflection = new ReflectionClass(ActionableChatbotService::class);
    $method = $reflection->getMethod('executeWriteAction');
    $method->setAccessible(true);

    $result = $method->invoke($service, 'add_product', [
        'name' => 'Kopi Luwak Premium',
        'price' => 35000,
        'stock' => 15,
        'description' => 'Kopi arabika berkualitas tinggi',
        'minimum' => 3
    ], $tempPath);

    expect($result['success'])->toBeTrue();
    $this->assertDatabaseHas('products', [
        'name' => 'Kopi Luwak Premium',
        'price' => 35000,
        'description' => 'Kopi arabika berkualitas tinggi',
        'minimum' => 3
    ]);

    $product = Product::query()->where('name', 'Kopi Luwak Premium')->first();
    expect($product->currentStock())->toBe(15);
    expect($product->thumbnail)->not->toBeNull();
    Storage::disk('public')->assertExists($product->thumbnail);
    Storage::disk('public')->assertMissing($tempPath); // Check moved
});
