<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function create(Product $product): Response
    {
        return Inertia::render('Product/Stock/Create', [
            'product' => $product,
        ]);
    }

    public function store(StoreStockRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $quantity = abs($validated['quantity']);
        if ($validated['type'] === 'out') {
            $quantity = -$quantity;
        }

        $product->stocks()->create([
            'quantity' => $quantity,
            'unit_cost' => $validated['unit_cost'] ?? null,
            'type' => $validated['type'],
            'note' => $validated['note'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('product.show', $product)
            ->with('success', 'Stock entry added successfully.');
    }
}
