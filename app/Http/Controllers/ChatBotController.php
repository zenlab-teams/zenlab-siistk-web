<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\SendMessageRequest;
use App\Services\ActionableChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChatBotController extends Controller
{
    protected ActionableChatbotService $chatbotService;

    public function __construct(ActionableChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Handle the incoming chat message request.
     *
     * @param SendMessageRequest $request
     * @return JsonResponse
     */
    public function __invoke(SendMessageRequest $request): JsonResponse
    {
        // Secondary security check
        abort_if(!auth()->user()->isAdmin(), 403);

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
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadTemp(Request $request): JsonResponse
    {
        // Security check
        abort_if(!auth()->user()->isAdmin(), 403);

        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'], // Max 5MB
        ]);

        $file = $request->file('image');
        
        // Store in temp folder on public disk
        $path = Storage::disk('public')->putFile('temp-chatbot', $file);
        
        return response()->json([
            'temp_path' => $path,
            'temp_url' => Storage::disk('public')->url($path)
        ], 201);
    }
}
