<?php

return [
    'name' => '37th IMLC & IYLC',
    'organiser' => 'The Men of Issachar Vision Inc.',
    'starts_at' => env('CONFERENCE_STARTS_AT', '2027-01-19T17:00:00+01:00'),
    'ends_at' => env('CONFERENCE_ENDS_AT', '2027-01-24T23:59:00+01:00'),
    'venue' => 'Leadership & Missions Conference Centre, Olororo, Ojoo, Ibadan, Nigeria',
    'onsite_capacity' => (int) env('CONFERENCE_ONSITE_CAPACITY', 2500),
    'sms_driver' => env('SMS_DRIVER', 'log'),
];
