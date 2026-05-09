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

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected $fillable = [
        'uuid',
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

        if ($this->expired_at) {
            return 'expired';
        }

        if ($this->checked_out_at) {
            // Ensure invoice exists and is fully paid (approved payments only)
            if ($this->invoice && $this->invoice->remaining_amount <= 0) {
                return 'completed';
            }
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

    public function offerRecord(): BelongsTo
    {
        return $this->belongsTo(OfferRecord::class, 'offer_record_id');
    }
}
