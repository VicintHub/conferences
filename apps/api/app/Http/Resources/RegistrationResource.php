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
            'attendee' => [
                'full_name' => $this->attendee->full_name,
                'first_name' => explode(' ', trim($this->attendee->full_name))[0],
                'email' => $this->attendee->email,
            ],
        ];
    }
}
