<?php

namespace App\Observers;

use App\Models\Offer;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class OfferObserver
{
    public function created(Offer $offer): void
    {
        DB::afterCommit(function () use ($offer): void {
            $freshOffer = $offer->fresh(['items']);
            if ($freshOffer === null) {
                return;
            }

            foreach ($freshOffer->items as $item) {
                Stock::query()->create([
                    'product_id' => $item->product_id,
                    'quantity' => -$item->quantity,
                    'type' => 'out',
                    'reference_id' => $freshOffer->id,
                    'reference_type' => Offer::class,
                    'note' => "Ngampas: {$freshOffer->name}",
                    'created_by' => $freshOffer->created_by,
                ]);
            }
        });
    }
}
