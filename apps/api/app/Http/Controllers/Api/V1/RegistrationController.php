<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Registration\Actions\RegisterAttendee;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Resources\RegistrationResource;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function store(RegisterRequest $request, RegisterAttendee $register): JsonResponse
    {
        $result = $register($request->validated());

        return (new RegistrationResource($result['registration']))
            ->additional(['meta' => ['token' => $result['token'], 'downgraded_to_online' => $result['downgraded']]])
            ->response()
            ->setStatusCode(201);
    }
}
