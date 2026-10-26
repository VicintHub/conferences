<?php

namespace App\Domain\Staff\Enums;

/** What each kind of staff member may open in the admin console. */
enum StaffRole: string
{
    case Admin = 'admin';
    case Registration = 'registration';
    case Content = 'content';
    case Moderator = 'moderator';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Registration => 'Registration',
            self::Content => 'Content',
            self::Moderator => 'Moderator',
        };
    }

    /** Console areas this role can use. Overview and the staff's own profile are open to everyone. */
    public function areas(): array
    {
        return match ($this) {
            self::Admin => ['registrants', 'approvals', 'teams', 'orders', 'broadcasts', 'testimonies', 'publicity', 'settings', 'staff'],
            self::Registration => ['registrants', 'approvals', 'teams', 'orders'],
            self::Content => ['broadcasts', 'testimonies', 'publicity', 'settings'],
            self::Moderator => ['testimonies'],
        };
    }

    public function can(string $area): bool
    {
        return in_array($area, $this->areas(), true);
    }
}
