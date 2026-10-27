<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hand stock back from unpaid orders whose hold has lapsed.
Schedule::command('shop:expire-orders')->everyFiveMinutes()->withoutOverlapping();
