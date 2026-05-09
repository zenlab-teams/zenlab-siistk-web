<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'due_date' => ['nullable', 'date', 'after:today'],
            'notes' => ['nullable', 'string', 'max:255'],
            'pay_now' => ['boolean'],
            'payment_type' => ['nullable', 'required_if:pay_now,true', 'in:dp,installment,full'],
            'payment_amount' => ['nullable', 'required_if:pay_now,true', 'integer', 'min:1'],
        ];
    }
}
