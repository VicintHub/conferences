<?php

namespace App\Domain\Registration\Actions;

use App\Domain\Registration\Models\Attendee;
use App\Domain\Registration\Models\OtpCode;
use App\Mail\LoginCodeMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

/**
 * Emails a 6-digit code and a one-click link for the same sign-in.
 * Silent when no attendee has the address, and the cooldown applies either way, so callers can't tell
 * whether an email is registered.
 */
class IssueLoginCode
{
    public const RESEND_AFTER_SECONDS = 60;

    public const TTL_MINUTES = 15;

    public function __invoke(string $email): void
    {
        $email = strtolower(trim($email));

        if (! Cache::add("otp-cooldown:{$email}", 1, self::RESEND_AFTER_SECONDS)) {
            return;
        }

        $attendee = Attendee::where('email', $email)->first();
        if (! $attendee) {
            return;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $token = bin2hex(random_bytes(24));

        OtpCode::where('email', $email)->whereNull('consumed_at')->update(['consumed_at' => now()]);
        OtpCode::create([
            'email' => $email,
            'code_hash' => self::codeHash($email, $code),
            'link_hash' => self::linkHash($token),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        $link = rtrim((string) config('app.frontend_url'), '/').'/auth/verify?'.http_build_query(['email' => $email, 'token' => $token]);

        Mail::to($email)->queue(new LoginCodeMail(
            firstName: explode(' ', trim($attendee->full_name))[0],
            code: $code,
            link: $link,
            minutes: self::TTL_MINUTES,
        ));
    }

    public static function codeHash(string $email, string $code): string
    {
        return hash_hmac('sha256', $email.'|'.$code, (string) config('app.key'));
    }

    public static function linkHash(string $token): string
    {
        return hash('sha256', $token);
    }
}
