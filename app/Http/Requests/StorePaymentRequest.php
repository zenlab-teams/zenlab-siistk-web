<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
            'amount' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:dp,installment,full'],
            'proof_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
