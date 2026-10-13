<?php

namespace App\Dto\Note;

use Symfony\Component\Validator\Constraints as Assert;

final class UpdateNoteDto
{
    #[Assert\Length(max: 160, maxMessage: 'Le titre ne peut pas dépasser 160 caractères.')]
    public ?string $title = null;

    #[Assert\Length(max: 65535, maxMessage: 'Le contenu est trop volumineux.')]
    public ?string $content = null;

    public ?string $color = null;

    public ?string $state = null;

    public ?string $tag = null;

    public ?bool $isPinned = null;
}