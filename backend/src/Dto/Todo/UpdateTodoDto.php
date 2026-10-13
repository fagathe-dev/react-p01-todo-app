<?php

namespace App\Dto\Todo;

use Symfony\Component\Validator\Constraints as Assert;

final class UpdateTodoDto
{
    #[Assert\Length(max: 200, maxMessage: 'Le nom ne peut pas dépasser 200 caractères.')]
    public ?string $name = null;

    public ?string $description = null;

    public ?bool $isDone = null;

    public ?string $dueDate = null;

    public ?string $tag = null;
}
