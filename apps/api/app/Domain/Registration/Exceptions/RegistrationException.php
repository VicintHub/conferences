<?php

namespace App\Domain\Registration\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

class RegistrationException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status, public readonly string $errorCode, public readonly array $extra = [])
    {
        parent::__construct($message);
    }

    public static function alreadyRegistered(): self
    {
        return new self('This phone number is already registered. Sign in instead.', 409, 'already_registered');
    }

    public static function tooSoon(int $retryAfter): self
    {
        return new self('Please wait before requesting another code.', 429, 'otp_too_soon', ['retry_after' => $retryAfter]);
    }

    public static function invalidCode(): self
    {
        return new self('That code is incorrect or has expired.', 422, 'invalid_otp');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage(), 'code' => $this->errorCode, ...$this->extra], $this->status);
    }
}
