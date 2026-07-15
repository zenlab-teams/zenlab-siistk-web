<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanTempChatbotFiles extends Command
{
    protected $signature = 'chatbot:clean-temp';
    protected $description = 'Clean up temporary chatbot files older than 24 hours';

    public function handle(): int
    {
        $disk = Storage::disk('public');
        if (! $disk->exists('temp-chatbot')) {
            $this->info('No temp-chatbot directory found.');
            return Command::SUCCESS;
        }

        $files = $disk->files('temp-chatbot');
        $count = 0;

        foreach ($files as $file) {
            if ($disk->lastModified($file) < now()->subDay()->getTimestamp()) {
                $disk->delete($file);
                $count++;
            }
        }

        $this->info("Cleaned up {$count} temporary files.");
        return Command::SUCCESS;
    }
}
