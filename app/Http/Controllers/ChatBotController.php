<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\SendMessageRequest;
use App\Services\ActionableChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ChatBotController extends Controller
{
    protected ActionableChatbotService $chatbotService;

    public function __construct(ActionableChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Handle the incoming chat message request.
     */
    public function __invoke(SendMessageRequest $request): JsonResponse
    {
        // Secondary security check
        abort_unless($request->user()?->isAdmin(), 403);

        $validated = $request->validated();
        $message = $validated['message'];
        $history = $validated['history'] ?? [];
        $imagePath = $validated['image_path'] ?? null;
        $clientTime = $validated['client_time'] ?? null;

        $response = $this->chatbotService->handle($message, $history, $imagePath, $clientTime);

        return response()->json($response);
    }

    /**
     * Upload a temporary image file for the chatbot.
     */
    public function uploadTemp(Request $request): JsonResponse
    {
        // Security check
        abort_unless($request->user()?->isAdmin(), 403);

        $validator = Validator::make(
            $request->all(),
            [
                'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            ],
            [
                'image.required' => 'Gambar wajib diunggah.',
                'image.image' => 'File harus berupa gambar.',
                'image.mimes' => 'Format gambar harus jpeg, png, jpg, gif, atau webp.',
                'image.max' => 'Ukuran gambar maksimal 5 MB.',
            ],
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Gagal mengunggah foto. Periksa ukuran dan format file.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('image');
            $path = Storage::disk('public')->putFile('temp-chatbot', $file);

            if (! $path) {
                return response()->json([
                    'message' => 'Gagal menyimpan foto sementara. Coba lagi.',
                ], 500);
            }

            return response()->json([
                'temp_path' => $path,
                'temp_url' => Storage::disk('public')->url($path),
            ], 201);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Gagal menyimpan foto sementara. Coba lagi.',
            ], 500);
        }
    }
}
