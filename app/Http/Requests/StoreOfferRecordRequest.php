<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOfferRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sale_id' => ['required', 'exists:sales,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'notes' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.sold_price' => ['required', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $offer = $this->route('offer');
        if ($offer === null) {
            return;
        }

        $allowedIds = $offer->items()->pluck('product_id')->map(fn ($id) => (int) $id)->all();

        $soldQuantities = $offer->records()
            ->where('status', '!=', 'rejected')
            ->with('items')
            ->get()
            ->pluck('items')
            ->flatten()
            ->groupBy('product_id')
            ->map(fn ($items) => $items->sum('quantity'));

        $offeredQuantities = $offer->items()->pluck('quantity', 'product_id');

        $validator->after(function (Validator $v) use ($allowedIds, $soldQuantities, $offeredQuantities): void {
            foreach ($this->input('items', []) as $index => $item) {
                if (isset($item['product_id'])) {
                    $productId = (int) $item['product_id'];
                    if (! in_array($productId, $allowedIds, true)) {
                        $v->errors()->add("items.{$index}.product_id", 'Produk tidak termasuk dalam offer ini.');

                        continue;
                    }

                    $remaining = ($offeredQuantities[$productId] ?? 0) - ($soldQuantities[$productId] ?? 0);
                    if (($item['quantity'] ?? 0) > $remaining) {
                        $v->errors()->add("items.{$index}.quantity", "Sisa stock tidak mencukupi (Sisa: {$remaining}).");
                    }
                }
            }
        });
    }
}
