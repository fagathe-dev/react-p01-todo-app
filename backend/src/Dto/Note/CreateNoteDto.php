<?php

namespace App\Dto\Note;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

final class CreateNoteDto
{
    #[Assert\Length(max: 160, maxMessage: 'Le titre ne peut pas dépasser 160 caractères.')]
    public ?string $title = null;

    #[Assert\Length(max: 65535, maxMessage: 'Le contenu est trop volumineux.')]
    public ?string $content = null;

    public ?string $color = null;

    #[Assert\Uuid(message: 'L\'identifiant du tag doit être un UUID valide.')]
    public ?string $tag = null;

    #[Assert\Callback]
    public function validateTitleOrContent(ExecutionContextInterface $context): void
    {
        if (empty(trim((string) $this->title)) && empty(trim((string) $this->content))) {
            $context->buildViolation('Le titre ou le contenu est obligatoire.')
                ->atPath('content')
                ->addViolation();
        }
    }
}
