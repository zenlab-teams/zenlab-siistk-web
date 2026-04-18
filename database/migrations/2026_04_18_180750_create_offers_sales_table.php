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
        Schema::create('offers_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers', 'id')->onDelete('restrict')->onUpdate('restrict');
            $table->foreignId('sale_id')->constrained('sales', 'id')->onDelete('restrict')->onUpdate('restrict');
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
        Schema::dropIfExists('offers_sales');
    }
};
