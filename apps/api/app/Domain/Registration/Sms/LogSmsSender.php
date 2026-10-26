<?php

namespace App\Domain\Registration\Sms;

use Illuminate\Support\Facades\Log;

/** Development driver: writes the message to the log instead of sending an SMS. */
class LogSmsSender implements SmsSender
{
    public function send(string $phone, string $message): void
    {
        Log::info('SMS', ['to' => $phone, 'message' => $message]);
    }
}
