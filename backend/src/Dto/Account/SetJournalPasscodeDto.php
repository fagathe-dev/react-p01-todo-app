<?php

namespace App\Dto\Account;

use Symfony\Component\Validator\Constraints as Assert;

final class SetJournalPasscodeDto
{
    public ?string $currentPasscode = null;

    #[Assert\NotBlank(message: 'Le code secret est obligatoire.')]
    #[Assert\Length(
        min: 4,
        max: 32,
        minMessage: 'Le code secret doit comporter au moins 4 caractères.',
        maxMessage: 'Le code secret ne peut pas dépasser 32 caractères.'
    )]
    public ?string $passcode = null;
}
