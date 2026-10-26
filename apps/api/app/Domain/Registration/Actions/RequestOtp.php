<?php

namespace App\Domain\Registration\Actions;

use App\Domain\Registration\Exceptions\RegistrationException;
use App\Domain\Registration\Models\OtpCode;
use App\Domain\Registration\Sms\SmsSender;

class RequestOtp
{
    public const RESEND_AFTER_SECONDS = 60;

    public const TTL_MINUTES = 10;

    public function __construct(private SmsSender $sms) {}

    public function __invoke(string $phone): void
    {
        $last = OtpCode::where('phone', $phone)->latest('id')->first();
        if ($last && $last->created_at->diffInSeconds(now(), true) < self::RESEND_AFTER_SECONDS) {
            throw RegistrationException::tooSoon((int) ceil(self::RESEND_AFTER_SECONDS - $last->created_at->diffInSeconds(now(), true)));
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::where('phone', $phone)->whereNull('consumed_at')->update(['consumed_at' => now()]);
        OtpCode::create([
            'phone' => $phone,
            'code_hash' => self::hash($phone, $code),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        // Trailing "@host #code" line lets Android auto-read the code (WebOTP).
        $host = parse_url((string) config('app.frontend_url'), PHP_URL_HOST) ?: 'localhost';
        $this->sms->send($phone, "Your Jan. Conf 2027 code is {$code}. It expires in ".self::TTL_MINUTES." minutes.\n\n@{$host} #{$code}");
    }

    public static function hash(string $phone, string $code): string
    {
        return hash_hmac('sha256', $phone.'|'.$code, (string) config('app.key'));
    }
}
