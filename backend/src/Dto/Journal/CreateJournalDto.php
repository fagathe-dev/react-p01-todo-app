<?php

namespace App\Dto\Journal;

use App\Enum\ColorEnum;
use App\Enum\MoodEnum;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

final class CreateJournalDto
{
    #[Assert\Length(max: 200, maxMessage: 'Le titre ne peut pas dépasser {{ limit }} caractères.')]
    public ?string $title = null;

    public ?string $content = null;

    #[Assert\Choice(callback: [ColorEnum::class, 'values'], message: 'Couleur invalide.')]
    public ?string $color = null;

    #[Assert\Choice(callback: [MoodEnum::class, 'values'], message: 'Humeur invalide.')]
    public ?string $mood = null;

    public ?bool $isPinned = false;

    #[Assert\Uuid(message: 'Format du tag invalide.')]
    public ?string $tag = null;

    public ?array $location = null;

    public ?bool $isConfidential = false;

    #[Assert\Callback]
    public function validate(ExecutionContextInterface $context): void
    {
        if (empty(trim((string) $this->title)) && empty(trim((string) $this->content))) {
            $context->buildViolation('Le titre ou le contenu est obligatoire.')
                ->atPath('content')
                ->addViolation();
        }
    }
}
