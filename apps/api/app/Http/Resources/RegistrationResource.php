<?php

namespace App\Http\Resources;

use App\Domain\Registration\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Registration */
class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'claim_code' => $this->claim_code,
            'category' => $this->category,
            'mode' => $this->mode,
            'days' => $this->days,
            'needs_accommodation' => $this->needs_accommodation,
            'status' => $this->status,
            'minister_verified' => (bool) $this->minister_verified_at,
            'badge' => $this->badge_printed_at ? ['printed_at' => $this->badge_printed_at->toIso8601String()] : null,
            // Scan history arrives with the scanner (build step 10); until then nothing is marked used.
            'access' => collect(['gate' => 'Gate', 'hall' => 'Hall', 'meal' => 'Meal', 'merch' => 'Merch'])
                ->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'used' => false])->values(),
            'attendee' => [
                'full_name' => $this->attendee->full_name,
                'first_name' => explode(' ', trim($this->attendee->full_name))[0],
                'email' => $this->attendee->email,
                'church' => $this->attendee->church,
            ],
        ];
    }
}
