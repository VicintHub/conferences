<?php

namespace Tests\Feature;

use App\Domain\Registration\Models\Attendee;
use App\Domain\Registration\Models\OtpCode;
use App\Domain\Registration\Sms\SmsSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationApiTest extends TestCase
{
    use RefreshDatabase;

    private const PHONE = '+2348034567821';

    /** @var array<int, array{0: string, 1: string}> */
    private array $sent = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->instance(SmsSender::class, new class($this) implements SmsSender
        {
            public function __construct(private RegistrationApiTest $test) {}

            public function send(string $phone, string $message): void
            {
                $this->test->record($phone, $message);
            }
        });
    }

    public function record(string $phone, string $message): void
    {
        $this->sent[] = [$phone, $message];
    }

    private function requestCode(string $phone = self::PHONE): string
    {
        $this->postJson('/api/v1/otp', ['phone' => $phone])->assertAccepted();
        preg_match('/code is (\d{6})/', end($this->sent)[1], $m);

        return $m[1];
    }

    private function payload(string $code, array $overrides = []): array
    {
        return array_merge([
            'category' => 'delegate',
            'full_name' => 'Adebayo Ogunleye',
            'phone' => self::PHONE,
            'email' => 'ade@example.com',
            'church' => 'Christ Life Assembly, Ibadan',
            'age_band' => '18-45',
            'mode' => 'onsite',
            'days' => ['2027-01-19', '2027-01-20'],
            'needs_accommodation' => true,
            'consent' => true,
            'code' => $code,
        ], $overrides);
    }

    public function test_full_registration_flow_returns_claim_ticket_and_token(): void
    {
        $code = $this->requestCode();

        $res = $this->postJson('/api/v1/registrations', $this->payload($code))->assertCreated();

        $res->assertJsonPath('data.attendee.first_name', 'Adebayo')
            ->assertJsonPath('data.mode', 'onsite')
            ->assertJsonPath('meta.downgraded_to_online', false);
        $this->assertMatchesRegularExpression('/^JC27-DLG-\d{5}$/', $res->json('data.claim_code'));

        $this->withToken($res->json('meta.token'))->getJson('/api/v1/me')->assertOk()->assertJsonPath('phone', self::PHONE);
        $this->getJson('/api/v1/capacity')->assertJsonPath('data.onsite.taken', 1);
    }

    public function test_wrong_code_is_rejected_and_nothing_is_created(): void
    {
        $this->requestCode();

        $this->postJson('/api/v1/registrations', $this->payload('000000'))
            ->assertStatus(422)->assertJsonPath('code', 'invalid_otp');
        $this->assertDatabaseCount('attendees', 0);
    }

    public function test_code_is_single_use_and_locks_after_five_failures(): void
    {
        $code = $this->requestCode();
        $this->postJson('/api/v1/registrations', $this->payload($code))->assertCreated();
        $this->postJson('/api/v1/registrations', $this->payload($code, ['phone' => '+2348000000001']))->assertStatus(422);

        $other = '+2348011111111';
        $real = $this->requestCode($other);
        $wrong = $real === '123456' ? '654321' : '123456';
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/registrations', $this->payload($wrong, ['phone' => $other]))->assertStatus(422);
        }
        $this->postJson('/api/v1/registrations', $this->payload($real, ['phone' => $other]))->assertStatus(422);
    }

    public function test_resend_is_blocked_for_sixty_seconds(): void
    {
        $this->requestCode();
        $this->postJson('/api/v1/otp', ['phone' => self::PHONE])
            ->assertStatus(429)->assertJsonPath('code', 'otp_too_soon');

        OtpCode::query()->update(['created_at' => now()->subMinute()]);
        $this->postJson('/api/v1/otp', ['phone' => self::PHONE])->assertAccepted();
    }

    public function test_phone_must_be_e164(): void
    {
        $this->postJson('/api/v1/otp', ['phone' => '08034567821'])->assertUnprocessable()->assertJsonValidationErrors('phone');
    }

    public function test_duplicate_phone_gets_conflict(): void
    {
        Attendee::create(['full_name' => 'Existing', 'phone' => self::PHONE, 'age_band' => '18-45']);
        $code = $this->requestCode();

        $this->postJson('/api/v1/registrations', $this->payload($code))->assertStatus(409)->assertJsonPath('code', 'already_registered');
    }

    public function test_onsite_overflow_falls_back_to_online(): void
    {
        config(['conference.onsite_capacity' => 1]);

        $first = $this->requestCode('+2348022222222');
        $this->postJson('/api/v1/registrations', $this->payload($first, ['phone' => '+2348022222222']))->assertCreated()->assertJsonPath('data.mode', 'onsite');

        $this->getJson('/api/v1/capacity')->assertJsonPath('data.onsite.full', true);

        $second = $this->requestCode('+2348033333333');
        $this->postJson('/api/v1/registrations', $this->payload($second, ['phone' => '+2348033333333']))
            ->assertCreated()
            ->assertJsonPath('data.mode', 'online')
            ->assertJsonPath('meta.downgraded_to_online', true);
        $this->getJson('/api/v1/capacity')->assertJsonPath('data.onsite.taken', 1);
    }

    public function test_requires_consent_and_at_least_one_valid_day(): void
    {
        $code = $this->requestCode();

        $this->postJson('/api/v1/registrations', $this->payload($code, ['consent' => false, 'days' => []]))
            ->assertUnprocessable()->assertJsonValidationErrors(['consent', 'days']);
        $this->postJson('/api/v1/registrations', $this->payload($code, ['days' => ['2027-02-01']]))
            ->assertUnprocessable()->assertJsonValidationErrors('days.0');
    }
}
