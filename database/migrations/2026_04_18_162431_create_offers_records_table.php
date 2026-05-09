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
        Schema::create('offers_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers')->restrictOnDelete()->restrictOnUpdate();
            $table->foreignId('sale_id')->constrained('sales')->restrictOnDelete()->restrictOnUpdate();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->restrictOnDelete()->restrictOnUpdate();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('notes')->nullable();
            $table->integer('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers_records');
    }
};
