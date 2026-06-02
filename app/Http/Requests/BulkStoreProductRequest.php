<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BulkStoreProductRequest extends FormRequest
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
            'products' => ['required', 'array', 'min:1', 'max:50'],
            'products.*.name' => ['required', 'string', 'max:255'],
            'products.*.price' => ['required', 'integer', 'min:0'],
            'products.*.description' => ['nullable', 'string'],
            'products.*.thumbnail' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'products.*.initial_quantity' => ['nullable', 'integer', 'min:1'],
            'products.*.initial_unit_cost' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'products.*.name.required' => 'Product name is required.',
            'products.*.price.required' => 'Product price is required.',
            'products.*.price.integer' => 'Product price must be a number.',
            'products.*.price.min' => 'Product price cannot be negative.',
            'products.*.initial_quantity.integer' => 'Quantity must be a number.',
            'products.*.initial_quantity.min' => 'Quantity must be at least 1.',
            'products.*.initial_unit_cost.integer' => 'Unit cost must be a number.',
            'products.*.initial_unit_cost.min' => 'Unit cost cannot be negative.',
        ];
    }
}
