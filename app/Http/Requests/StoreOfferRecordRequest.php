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

        $validator->after(function (Validator $v) use ($allowedIds): void {
            foreach ($this->input('items', []) as $index => $item) {
                if (isset($item['product_id']) && ! in_array((int) $item['product_id'], $allowedIds, true)) {
                    $v->errors()->add("items.{$index}.product_id", 'Produk tidak termasuk dalam offer ini.');
                }
            }
        });
    }
}
