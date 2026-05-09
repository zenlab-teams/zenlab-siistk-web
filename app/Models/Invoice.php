<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected bool $paidAmountResolved = false;

    protected int $paidAmountValue = 0;

    protected $fillable = [
        'order_id',
        'total_amount',
        'due_date',
        'notes',
        'created_by',
    ];

    protected $appends = ['status', 'paid_amount', 'remaining_amount'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'due_date' => 'date',
        ];
    }

    public function getStatusAttribute(): string
    {
        $paid = $this->resolvePaidAmount();

        if ($paid <= 0) {
            return 'unpaid';
        }

        if ($paid < $this->total_amount) {
            return 'partial';
        }

        return 'paid';
    }

    public function getPaidAmountAttribute(): int
    {
        return $this->resolvePaidAmount();
    }

    public function getRemainingAmountAttribute(): int
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    private function resolvePaidAmount(): int
    {
        if ($this->paidAmountResolved) {
            return $this->paidAmountValue;
        }

        $this->paidAmountValue = $this->relationLoaded('payments')
            ? (int) $this->payments->where('status', 'approved')->sum('amount')
            : (int) $this->payments()->where('status', 'approved')->sum('amount');
        $this->paidAmountResolved = true;

        return $this->paidAmountValue;
    }
}
