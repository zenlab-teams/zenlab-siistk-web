<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\Helpers\ImageGenerator;
use Illuminate\Database\Seeder;

class InvoicePaymentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        // Get all completed orders (checked_out_at is set, not cancelled/expired)
        $completedOrders = Order::query()
            ->whereNotNull('checked_out_at')
            ->whereNull('cancelled_at')
            ->whereNull('expired_at')
            ->get();

        $proofIndex = 0;

        foreach ($completedOrders as $order) {
            $invoice = Invoice::create([
                'order_id' => $order->id,
                'total_amount' => $order->total_price,
                'due_date' => $order->checked_out_at->copy()->addDays(7),
                'notes' => fake()->optional(0.3)->sentence(),
                'created_by' => $admin->id,
            ]);

            // Determine payment scenario based on random chance
            $scenario = fake()->randomElement(['full', 'full', 'full', 'full', 'full', 'full', 'full', 'partial', 'partial', 'unpaid']);
            // 70% full, 20% partial, 10% unpaid

            if ($scenario === 'full') {
                $proofImage = ImageGenerator::generatePaymentProof($invoice->id, $proofIndex++);
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $invoice->total_amount,
                    'type' => 'full',
                    'proof_image' => $proofImage,
                    'note' => 'Pembayaran lunas',
                    'status' => 'approved',
                    'created_by' => $order->created_by ?? $admin->id,
                ]);
            } elseif ($scenario === 'partial') {
                // DP payment
                $dpAmount = (int) ($invoice->total_amount * 0.5);
                $proofImage1 = ImageGenerator::generatePaymentProof($invoice->id, $proofIndex++);
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $dpAmount,
                    'type' => 'dp',
                    'proof_image' => $proofImage1,
                    'note' => 'Down payment 50%',
                    'status' => 'approved',
                    'created_by' => $order->created_by ?? $admin->id,
                ]);

                // Sometimes add a pending installment
                if (fake()->boolean(60)) {
                    $proofImage2 = ImageGenerator::generatePaymentProof($invoice->id, $proofIndex++);
                    Payment::create([
                        'invoice_id' => $invoice->id,
                        'amount' => $invoice->total_amount - $dpAmount,
                        'type' => 'installment',
                        'proof_image' => $proofImage2,
                        'note' => 'Pelunasan sisa',
                        'status' => 'pending',
                        'created_by' => $order->created_by ?? $admin->id,
                    ]);
                }
            }
            // 'unpaid' scenario: no payments created
        }
    }
}
