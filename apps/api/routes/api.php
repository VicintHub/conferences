<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CapacityController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\FeedbackController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentWebhookController;
use App\Http\Controllers\Api\V1\ProgrammeController;
use App\Http\Controllers\Api\V1\PublicityController;
use App\Http\Controllers\Api\V1\RegistrationController;
use App\Http\Controllers\Api\V1\ShopController;
use App\Http\Controllers\Api\V1\SpeakerController;
use App\Http\Controllers\Api\V1\SurveyController;
use App\Http\Controllers\Api\V1\TestimonyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);
    Route::get('/event', EventController::class);
    Route::get('/capacity', CapacityController::class);
    Route::get('/programme', ProgrammeController::class);
    Route::get('/speakers', [SpeakerController::class, 'index']);
    Route::get('/speakers/{slug}', [SpeakerController::class, 'show']);
    Route::get('/publicity', [PublicityController::class, 'index']);
    Route::get('/publicity/{slug}', [PublicityController::class, 'show']);
    Route::post('/publicity/{slug}/track', [PublicityController::class, 'track'])->middleware('throttle:120,1');
    Route::get('/shop/products', [ShopController::class, 'index']);
    Route::get('/shop/products/{slug}', [ShopController::class, 'show']);
    Route::post('/shop/checkout', CheckoutController::class)->middleware('throttle:10,1');
    Route::get('/shop/orders/{code}', [OrderController::class, 'show']);
    Route::post('/shop/orders/{code}/verify', [OrderController::class, 'verify'])->middleware('throttle:60,1');
    Route::post('/webhooks/paystack', [PaymentWebhookController::class, 'paystack']);
    Route::post('/shop/payments/mock/{reference}/complete', [PaymentWebhookController::class, 'mock']);
    Route::get('/testimonies', [TestimonyController::class, 'index']);
    Route::post('/testimonies', [TestimonyController::class, 'store'])->middleware('throttle:testimonies');

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

        Route::put('/testimonies/{testimony}/amen', [TestimonyController::class, 'amen']);
        Route::delete('/testimonies/{testimony}/amen', [TestimonyController::class, 'unamen']);
        Route::post('/sessions/{session}/feedback', [FeedbackController::class, 'store']);
        Route::post('/shop/orders/{code}/attach', [OrderController::class, 'attach']);
        Route::get('/me/orders', [OrderController::class, 'mine']);
        Route::get('/me/feedback', [FeedbackController::class, 'mine']);
        Route::get('/survey', [SurveyController::class, 'show']);
        Route::post('/survey', [SurveyController::class, 'store']);
    });
});
