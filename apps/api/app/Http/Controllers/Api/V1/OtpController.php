<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Registration\Actions\RequestOtp;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RequestOtpRequest;
use Illuminate\Http\JsonResponse;

class OtpController extends Controller
{
    public function __invoke(RequestOtpRequest $request, RequestOtp $requestOtp): JsonResponse
    {
        $requestOtp($request->validated('phone'));

        return response()->json(['resend_after' => RequestOtp::RESEND_AFTER_SECONDS], 202);
    }
}
