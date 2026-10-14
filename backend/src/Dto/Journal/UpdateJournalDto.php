<?php

namespace App\Dto\Journal;

use App\Enum\ColorEnum;
use App\Enum\MoodEnum;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateJournalDto
{
    #[Assert\Length(max: 200, maxMessage: 'Le titre ne peut pas dépasser {{ limit }} caractères.')]
    public ?string $title = null;

    public ?string $content = null;

    #[Assert\Choice(callback: [ColorEnum::class, 'values'], message: 'Couleur invalide.')]
    public ?string $color = null;

    #[Assert\Choice(callback: [MoodEnum::class, 'values'], message: 'Humeur invalide.')]
    public ?string $mood = null;

    public ?bool $isPinned = null;

    #[Assert\Uuid(message: 'Format du tag invalide.')]
    public ?string $tag = null;

    public ?array $location = null;

    public ?bool $isConfidential = null;
}
