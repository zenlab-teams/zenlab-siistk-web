<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class PublicOrderController extends Controller
{
    public function show(string $uuid): Response
    {
        $order = Order::query()
            ->where('uuid', $uuid)
            ->with([
                'customer',
                'items.product:id,name,thumbnail',
                'invoice.payments.creator:id,name',
                'creator:id,name',
                'offerRecord.sale.user:id,name',
            ])
            ->firstOrFail();

        return Inertia::render('Public/Order/Show', [
            'order' => $order,
        ]);
    }

    public function storePayment(\Illuminate\Http\Request $request, string $uuid): \Illuminate\Http\RedirectResponse
    {
        $order = \App\Models\Order::query()->where('uuid', $uuid)->firstOrFail();
        $invoice = $order->invoice()->firstOrFail();

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:dp,installment,full'],
            'proof_image' => ['required', 'image', 'max:2048'],
            'note' => ['nullable', 'string'],
        ]);

        $path = $request->file('proof_image')->store('paymentProofs', 'public');

        $invoice->payments()->create([
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'proof_image' => $path,
            'note' => $validated['note'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Payment proof submitted. Waiting for admin approval.');
    }
}
