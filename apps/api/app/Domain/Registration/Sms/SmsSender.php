<?php

namespace App\Domain\Registration\Sms;

interface SmsSender
{
    public function send(string $phone, string $message): void;
}
