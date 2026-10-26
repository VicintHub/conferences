<?php

namespace App\Domain\Registration\Actions;

use App\Domain\Registration\Enums\AttendanceMode;
use App\Domain\Registration\Enums\RegistrationCategory;
use App\Domain\Registration\Exceptions\RegistrationException;
use App\Domain\Registration\Models\Attendee;
use App\Domain\Registration\Models\Registration;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class RegisterAttendee
{
    public function __construct(
        private VerifyOtp $verifyOtp,
        private ClaimOnsiteSeat $claimSeat,
        private GenerateClaimCode $claimCode,
    ) {}

    /**
     * @param  array<string, mixed>  $data  validated payload (see RegisterRequest)
     * @return array{registration: Registration, token: string, downgraded: bool}
     */
    public function __invoke(array $data): array
    {
        // Outside the transaction on purpose: failed-attempt counts must survive a rollback.
        ($this->verifyOtp)($data['phone'], $data['code']);

        // After code verification, so unauthenticated callers can't probe which phones are registered.
        if (Attendee::where('phone', $data['phone'])->exists()) {
            throw RegistrationException::alreadyRegistered();
        }

        try {
            return DB::transaction(function () use ($data) {
                $mode = AttendanceMode::from($data['mode']);
                $downgraded = false;
                if ($mode === AttendanceMode::Onsite && ! ($this->claimSeat)()) {
                    $mode = AttendanceMode::Online;
                    $downgraded = true;
                }

                $attendee = Attendee::create([
                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'email' => $data['email'] ?? null,
                    'church' => $data['church'] ?? null,
                    'location' => $data['location'] ?? null,
                    'age_band' => $data['age_band'],
                    'phone_verified_at' => now(),
                ]);

                $category = RegistrationCategory::from($data['category']);
                $registration = $attendee->registration()->create([
                    'category' => $category,
                    'mode' => $mode,
                    'days' => array_values(array_unique($data['days'])),
                    'needs_accommodation' => (bool) ($data['needs_accommodation'] ?? false),
                    'status' => 'confirmed',
                    'claim_code' => ($this->claimCode)($category),
                    'consented_at' => now(),
                ]);

                return [
                    'registration' => $registration->setRelation('attendee', $attendee),
                    'token' => $attendee->createToken('attendee')->plainTextToken,
                    'downgraded' => $downgraded,
                ];
            });
        } catch (QueryException $e) {
            // Unique(phone) lost a race with a concurrent submission.
            if (Attendee::where('phone', $data['phone'])->exists()) {
                throw RegistrationException::alreadyRegistered();
            }
            throw $e;
        }
    }
}
