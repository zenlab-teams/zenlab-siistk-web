<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OfferRecord extends Model
{
    protected $table = 'offers_records';

    protected $fillable = [
        'offer_id',
        'sale_id',
        'customer_id',
        'status',
        'notes',
        'created_by',
    ];

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OfferRecordItem::class, 'offer_record_id');
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class, 'offer_record_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
