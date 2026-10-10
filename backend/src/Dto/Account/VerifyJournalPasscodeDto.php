<?php

namespace App\Dto\Account;

use Symfony\Component\Validator\Constraints as Assert;

final class VerifyJournalPasscodeDto
{
    #[Assert\NotBlank(message: 'Veuillez renseigner le code secret.')]
    public ?string $passcode = null;
}
