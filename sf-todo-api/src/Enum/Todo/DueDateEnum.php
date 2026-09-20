<?php

namespace App\Enum\Todo;

use DateTimeImmutable;

enum DueDateEnum: string
{
    case Today = 'today';
    case Tomorrow = 'tomorrow';
    case ThisWeek = 'this_week';
    case Later = 'later';

    public static function getMap(self|string|null $enum = null): array|string|null
    {
        $options = [
            self::Today->value => 'Aujourd\'hui',
            self::Tomorrow->value => 'Demain',
            self::ThisWeek->value => 'Cette semaine',
            self::Later->value => 'Plus tard',
        ];

        if ($enum !== null) {
            if (is_string($enum)) {
                $enum = self::tryFrom($enum);
            }

            return $enum ? ($options[$enum->value] ?? null) : null;
        }

        return $options;
    }

    public static function label(self $enum): string
    {
        return self::getMap($enum) ?? $enum->value;
    }

    /**
     * @return array<string, string>
     */
    public static function choices(): array
    {
        $choices = [];
        foreach (static::cases() as $case) {
            $choices[$case->value] = self::label($case);
        }
        return $choices;
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(static::cases(), 'value');
    }

    public static function generateDatetimeFromEnum(string|self|null $dueDate): ?DateTimeImmutable
    {
        if ($dueDate === null) {
            return null;
        }

        if (is_string($dueDate)) {
            $dueDate = static::tryFrom($dueDate);
            if ($dueDate === null) {
                return null;
            }
        }

        $mutator = match ($dueDate) {
            self::Today => 'now',
            self::Tomorrow => '+1 day',
            self::ThisWeek => 'sunday this week',
            self::Later => '+2 days',
        };

        $dateTime = new DateTimeImmutable($mutator, new \DateTimeZone('Europe/Paris'));

        return $dateTime->setTime(23, 59, 59);
    }
}
