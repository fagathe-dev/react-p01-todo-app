<?php

namespace App\Dto\Todo;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateTodoDto
{
    #[Assert\NotBlank(message: 'Le nom de la tâche est obligatoire.')]
    #[Assert\Length(max: 200, maxMessage: 'Le nom ne peut pas dépasser 200 caractères.')]
    public ?string $name = null;

    public ?string $description = null;

    public ?string $dueDate = null;

    #[Assert\Uuid(message: 'L\'identifiant du tag doit être un UUID valide.')]
    public ?string $tag = null;
}