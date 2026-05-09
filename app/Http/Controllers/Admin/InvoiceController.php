<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
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
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Payment recorded successfully.');
    }
}
