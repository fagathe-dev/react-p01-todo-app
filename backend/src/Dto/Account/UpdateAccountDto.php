<?php

namespace App\Dto\Account;

use Symfony\Component\Validator\Constraints as Assert;

final class UpdateAccountDto
{
    #[Assert\NotBlank(message: 'Le nom d\'utilisateur est obligatoire.')]
    #[Assert\Length(
        min: 3,
        max: 90,
        minMessage: 'Le nom d\'utilisateur doit comporter au moins 3 caractères.',
        maxMessage: 'Le nom d\'utilisateur ne peut pas dépasser 90 caractères.'
    )]
    public ?string $username = null;

    #[Assert\Length(max: 80, maxMessage: 'Le prénom ne peut pas dépasser 80 caractères.')]
    public ?string $firstname = null;

    #[Assert\Length(max: 80, maxMessage: 'Le nom de famille ne peut pas dépasser 80 caractères.')]
    public ?string $lastname = null;
}