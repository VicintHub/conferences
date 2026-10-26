<?php

namespace App\Providers;

use App\Domain\Registration\Sms\LogSmsSender;
use App\Domain\Registration\Sms\SmsSender;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(SmsSender::class, fn () => match (config('conference.sms_driver')) {
            'log' => new LogSmsSender,
            default => throw new InvalidArgumentException('Unsupported SMS driver ['.config('conference.sms_driver').'].'),
        });
    }

    public function boot(): void
    {
        // Per phone and per IP, so one number can't be bombed and one client can't spray many numbers.
        RateLimiter::for('otp', fn (Request $request) => [
            Limit::perHour(5)->by('otp-phone:'.$request->input('phone')),
            Limit::perHour(20)->by('otp-ip:'.$request->ip()),
        ]);
    }
}
