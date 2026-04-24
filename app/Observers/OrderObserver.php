<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\Stock;

class OrderObserver
{
    public function updated(Order $order): void
    {
        if (! $order->wasChanged('checked_out_at')) {
            return;
        }

        if ($order->checked_out_at === null) {
            return;
        }

        if ($order->getOriginal('checked_out_at') !== null) {
            return;
        }

        foreach ($order->items()->get() as $item) {
            Stock::create([
                'product_id' => $item->product_id,
                'quantity' => -$item->quantity,
                'unit_cost' => null,
                'type' => 'out',
                'reference_id' => $order->id,
                'reference_type' => 'order',
                'note' => "Order #{$order->id} checkout",
                'created_by' => auth()->id(),
            ]);
        }
    }
}
