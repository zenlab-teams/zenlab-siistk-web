<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'minimum' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            'initial_quantity' => ['nullable', 'integer', 'min:1'],
            'initial_unit_cost' => ['nullable', 'integer', 'min:0'],
            'initial_note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
