<?php

namespace App\Enum\Todo;

enum TagColorEnum: string
{
    case Red = 'red';
    case Orange = 'orange';
    case Yellow = 'yellow';
    case Green = 'green';
    case Blue = 'blue';
    case Cyan = 'cyan';
    case Purple = 'purple';
    case Violet = 'violet';
    case Fuchsia = 'fuchsia';
    case Pink = 'pink';
    case Slate = 'slate';
    case Gray = 'gray';
    case Stone = 'stone';

    /**
     * @return array<string, string>
     */
    public static function choices(): array
    {
        return array_reduce(static::cases(), fn($carry, $i) => [...$carry, $i->value => $i->value], []);
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_reduce(static::cases(), fn($carry, $i) => [...$carry, $i->value], []);
    }
}
