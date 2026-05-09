<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'date',
        'rejected_at',
        'completed_at',
        'created_by',
    ];

    protected $appends = ['status'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'rejected_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function getStatusAttribute(): string
    {
        if ($this->rejected_at) {
            return 'rejected';
        }

        if ($this->completed_at) {
            return 'completed';
        }

        return 'active';
    }

    public function items(): HasMany
    {
        return $this->hasMany(OfferItem::class);
    }

    public function offerSales(): HasMany
    {
        return $this->hasMany(OfferSale::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(OfferRecord::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
