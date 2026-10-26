<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CapacityController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\ProgrammeController;
use App\Http\Controllers\Api\V1\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);
    Route::get('/event', EventController::class);
    Route::get('/capacity', CapacityController::class);
    Route::get('/programme', ProgrammeController::class);

    Route::post('/registrations', [RegistrationController::class, 'store'])->middleware('throttle:otp');

    Route::prefix('auth')->group(function () {
        Route::post('/otp', [AuthController::class, 'otp'])->middleware('throttle:otp');
        Route::post('/verify', [AuthController::class, 'verify'])->middleware('throttle:verify');
        Route::post('/verify-link', [AuthController::class, 'verifyLink'])->middleware('throttle:verify');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [MeController::class, 'show']);
        Route::patch('/me/registration', [MeController::class, 'updateRegistration']);
        Route::post('/auth/logout', [MeController::class, 'logout']);
    });
});
