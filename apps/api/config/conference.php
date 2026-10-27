<?php

return [
    'name' => '37th IMLC & IYLC',
    'organiser' => 'The Men of Issachar Vision Inc.',
    'starts_at' => env('CONFERENCE_STARTS_AT', '2027-01-19T17:00:00+01:00'),
    'ends_at' => env('CONFERENCE_ENDS_AT', '2027-01-24T23:59:00+01:00'),
    'venue' => 'Leadership & Missions Conference Centre, Olororo, Ojoo, Ibadan, Nigeria',
    'onsite_capacity' => (int) env('CONFERENCE_ONSITE_CAPACITY', 2500),
    // Headline for each day, shown in "The week" on the desktop dashboard.
    'day_titles' => [
        '2027-01-19' => 'Evening of Worship',
        '2027-01-20' => 'IMLC Day 1',
        '2027-01-21' => 'IMLC Day 2',
        '2027-01-22' => 'IMLC Day 3',
        '2027-01-23' => 'Royal Conf. + IYLC',
        '2027-01-24' => 'IMLC Closing',
    ],
];
