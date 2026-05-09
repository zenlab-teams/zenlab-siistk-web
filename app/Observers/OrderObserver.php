<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class OrderObserver
{
    public function created(Order $order): void
    {
        if ($order->checked_out_at === null) {
            return;
        }

        if ($order->offer_record_id !== null) {
            return;
        }

        DB::afterCommit(function () use ($order): void {
            $freshOrder = $order->fresh();
            if ($freshOrder === null) {
                return;
            }

            $this->deductStock($freshOrder);
        });
    }

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

        if ($order->offer_record_id !== null) {
            return;
        }

        $this->deductStock($order);
    }

    private function deductStock(Order $order): void
    {
        foreach ($order->items()->get() as $item) {
            Stock::query()->create([
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
