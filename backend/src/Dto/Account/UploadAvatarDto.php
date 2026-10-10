<?php

namespace App\Dto\Account;

use Fagathe\CorePhp\File\MimeType;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;

final class UploadAvatarDto
{
    #[Assert\NotNull(message: 'Veuillez sélectionner une image pour votre avatar.')]
    #[Assert\File(
        maxSize: '12M',
        mimeTypes: MimeType::IMAGE_MIMES,
        maxSizeMessage: 'L\'avatar ne doit pas dépasser 5 Mo.',
        mimeTypesMessage: 'Format d\'image non supporté (formats acceptés : JPEG, PNG, WebP, GIF).'
    )]
    public ?UploadedFile $file = null;

    public function __construct(?UploadedFile $file = null)
    {
        $this->file = $file;
    }
}
