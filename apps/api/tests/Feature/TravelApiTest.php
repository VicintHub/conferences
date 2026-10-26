<?php

namespace Tests\Feature;

use App\Domain\Registration\Models\Attendee;
use App\Domain\Travel\Models\Hotel;
use Database\Seeders\TravelSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelApiTest extends TestCase
{
    use RefreshDatabase;

    private function signedIn(): static
    {
        $a = Attendee::create(['full_name' => 'Ade', 'email' => 'ade@example.com', 'age_band' => '18-45', 'email_verified_at' => now()]);
        $a->registration()->create(['category' => 'delegate', 'mode' => 'online', 'days' => ['2027-01-19'], 'status' => 'confirmed', 'claim_code' => 'JC27-DLG-12345']);

        return $this->withToken($a->createToken('t')->plainTextToken);
    }

    public function test_travel_is_for_signed_in_attendees(): void
    {
        $this->getJson('/api/v1/travel')->assertUnauthorized();
    }

    public function test_hotels_come_nearest_first_with_the_rate_code_only_on_partner_hotels(): void
    {
        $this->seed(TravelSeeder::class);

        $res = $this->signedIn()->getJson('/api/v1/travel')->assertOk();
        $hotels = $res->json('data.hotels');

        $this->assertSame(['olororo', 'ojoo', 'moniya', 'bodija'], array_column($hotels, 'slug'));
        $this->assertSame(1800000, $hotels[0]['price_kobo']);
        $this->assertSame(0.8, $hotels[0]['distance_km']);
        $this->assertSame('JANCONF27', $hotels[0]['rate_code']);
        $this->assertNull($hotels[2]['rate_code']);
        $this->assertContains('Generator 24h', $hotels[0]['amenities']);
    }

    public function test_the_payload_includes_the_venue_and_shuttles_and_hides_inactive_hotels(): void
    {
        $this->seed(TravelSeeder::class);
        Hotel::where('slug', 'bodija')->update(['active' => false]);

        $res = $this->signedIn()->getJson('/api/v1/travel');

        $this->assertCount(3, $res->json('data.hotels'));
        $this->assertSame('Leadership & Missions Conference Centre', $res->json('data.venue.name'));
        $this->assertIsFloat($res->json('data.venue.lat'));
        $this->assertSame(['Ojoo roundabout', 'Iwo Road interchange', 'Partner hotels'], array_column($res->json('data.shuttles'), 'name'));
    }

    public function test_seeding_the_design_data_is_repeatable(): void
    {
        $this->seed(TravelSeeder::class);
        $this->seed(TravelSeeder::class);
        $this->assertSame(4, Hotel::count());
    }
}
