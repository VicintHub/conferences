<?php

use App\Http\Controllers\Api\V1\CapacityController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\OtpController;
use App\Http\Controllers\Api\V1\RegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);
    Route::get('/event', EventController::class);
    Route::get('/capacity', CapacityController::class);

    Route::post('/otp', OtpController::class)->middleware('throttle:otp');
    Route::post('/registrations', [RegistrationController::class, 'store'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->get('/me', fn (Request $request) => $request->user());
});
