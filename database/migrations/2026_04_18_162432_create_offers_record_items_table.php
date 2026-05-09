<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('offers_record_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_record_id')->constrained('offers_records')->restrictOnDelete()->restrictOnUpdate();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete()->restrictOnUpdate();
            $table->integer('quantity');
            $table->integer('sold_price');
            $table->integer('subtotal');
            $table->integer('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers_record_items');
    }
};
