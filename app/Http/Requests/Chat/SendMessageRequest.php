<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'client_time' => ['sometimes', 'nullable', 'string'],
            'history' => ['sometimes', 'array'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,assistant'],
            'history.*.text' => ['required_with:history', 'string', 'max:4000'],
        ];
    }
}
