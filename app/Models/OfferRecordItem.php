<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfferRecordItem extends Model
{
    protected $table = 'offers_record_items';

    protected $fillable = [
        'offer_record_id',
        'product_id',
        'quantity',
        'sold_price',
        'subtotal',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'sold_price' => 'integer',
            'subtotal' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function record(): BelongsTo
    {
        return $this->belongsTo(OfferRecord::class, 'offer_record_id');
    }
}
