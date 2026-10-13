<?php

namespace App\Dto\Tag;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateTagDto
{
    #[Assert\NotBlank(message: 'Le nom du tag est obligatoire.')]
    #[Assert\Length(max: 50, maxMessage: 'Le nom ne peut pas dépasser 50 caractères.')]
    public ?string $name = null;

    #[Assert\NotBlank(message: 'La couleur est obligatoire.')]
    public ?string $color = null;

    public ?string $description = null;
}