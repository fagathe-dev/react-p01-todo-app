<?php

namespace App\Dto\Todo;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateTodoCommentDto
{
    #[Assert\NotBlank(message: 'Le contenu du commentaire ne peut pas être vide.')]
    #[Assert\Length(max: 5000, maxMessage: 'Le commentaire ne peut pas dépasser 5000 caractères.')]
    public ?string $content = null;
}