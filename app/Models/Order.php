<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'offer_record_id',
        'total_price',
        'checked_out_at',
        'cancelled_at',
        'expired_at',
        'created_by',
    ];

    protected $appends = ['status'];

    protected function casts(): array
    {
        return [
            'total_price' => 'integer',
            'checked_out_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'expired_at' => 'datetime',
        ];
    }

    public function getStatusAttribute(): string
    {
        if ($this->cancelled_at) {
            return 'cancelled';
        }

        if ($this->checked_out_at) {
            return 'completed';
        }

        if ($this->expired_at) {
            return 'expired';
        }

        return 'pending';
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
