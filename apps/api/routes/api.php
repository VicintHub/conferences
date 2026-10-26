<?php

use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);
    Route::get('/event', EventController::class);

    Route::middleware('auth:sanctum')->get('/me', fn (Request $request) => $request->user());
});
