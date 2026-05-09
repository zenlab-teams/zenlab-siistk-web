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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->restrictOnDelete()->restrictOnUpdate();
            $table->integer('amount');
            $table->enum('type', ['dp', 'installment', 'full']);
            $table->string('proof_image')->nullable();
            $table->string('note')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->integer('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
