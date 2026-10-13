<?php

namespace App\Dto\Tag;

use Symfony\Component\Validator\Constraints as Assert;

final class UpdateTagDto
{
    #[Assert\Length(max: 50, maxMessage: 'Le nom ne peut pas dépasser 50 caractères.')]
    public ?string $name = null;

    public ?string $color = null;

    public ?string $description = null;
}