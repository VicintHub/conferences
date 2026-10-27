<?php

namespace Database\Seeders;

use App\Domain\Travel\Models\Hotel;
use App\Domain\Travel\Models\Shuttle;
use Illuminate\Database\Seeder;

/**
 * Placeholder hotels and shuttles from the design handoff. Contact numbers are the conference office until the
 * committee enters each hotel's own, and prices and distances should be confirmed before launch.
 */
class TravelSeeder extends Seeder
{
    public function run(): void
    {
        $office = '+2348080854818';
        $amenities = ['Breakfast', 'Wi-Fi', 'Generator 24h', 'Shuttle'];

        Hotel::query()->delete();
        foreach ([
            ['olororo', 'Olororo Guest Lodge', 'Olororo, Ojoo', 1800000, 0.8, 3, true, '/images/photos/lp-hotel.webp', 'Shuttle to the venue every 30 minutes from 7 AM.'],
            ['ojoo', 'Ojoo Grand Hotel', 'Ojoo roundabout', 2500000, 2.4, 8, true, null, 'Shuttle to the venue every 30 minutes from 7 AM.'],
            ['moniya', 'Moniya Suites', 'Oyo Road, Moniya', 1500000, 5.1, 14, false, null, null],
            ['bodija', 'Bodija Executive Inn', 'Bodija, Ibadan', 3500000, 9.6, 25, false, null, null],
        ] as $i => [$slug, $name, $area, $price, $km, $mins, $partner, $image, $shuttle]) {
            Hotel::create([
                'slug' => $slug, 'name' => $name, 'area' => $area, 'price_kobo' => $price, 'distance_km' => $km, 'drive_minutes' => $mins,
                'conference_rate' => $partner, 'image' => $image, 'amenities' => $amenities, 'shuttle_note' => $shuttle,
                'phone' => $office, 'whatsapp' => $office, 'sort' => $i,
            ]);
        }

        Shuttle::query()->delete();
        foreach ([
            ['Ojoo roundabout', 'Every 20 min · 6:30 AM – 10 PM'],
            ['Iwo Road interchange', 'Every 45 min · 6 AM – 9 PM'],
            ['Partner hotels', 'Every 30 min from 7 AM'],
        ] as $i => [$name, $schedule]) {
            Shuttle::create(['name' => $name, 'schedule' => $schedule, 'sort' => $i]);
        }
    }
}
