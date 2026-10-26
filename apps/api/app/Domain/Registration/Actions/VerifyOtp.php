<?php

namespace App\Domain\Registration\Actions;

use App\Domain\Registration\Exceptions\RegistrationException;
use App\Domain\Registration\Models\OtpCode;

class VerifyOtp
{
    public const MAX_ATTEMPTS = 5;

    /** Consumes the latest live code for the phone, or throws. */
    public function __invoke(string $phone, string $code): void
    {
        $otp = OtpCode::where('phone', $phone)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        if (! $otp || $otp->attempts >= self::MAX_ATTEMPTS) {
            throw RegistrationException::invalidCode();
        }

        if (! hash_equals($otp->code_hash, RequestOtp::hash($phone, $code))) {
            $otp->increment('attempts');
            throw RegistrationException::invalidCode();
        }

        // Atomic claim: a concurrent request with the same code loses.
        if (OtpCode::whereKey($otp->id)->whereNull('consumed_at')->update(['consumed_at' => now()]) === 0) {
            throw RegistrationException::invalidCode();
        }
    }
}
