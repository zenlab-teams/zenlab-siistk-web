<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;

class InvoiceController extends Controller
{
    public function storePayment(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('proof_image')) {
            $data['proof_image'] = $request->file('proof_image')->store('paymentProofs', 'public');
        }

        $invoice->payments()->create([
            ...$data,
            'status' => 'approved', // Admin direct entry is auto-approved
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function approvePayment(Payment $payment): RedirectResponse
    {
        $payment->update(['status' => 'approved']);

        return back()->with('success', 'Payment approved.');
    }

    public function rejectPayment(Payment $payment): RedirectResponse
    {
        $payment->update(['status' => 'rejected']);

        return back()->with('success', 'Payment rejected.');
    }
}
