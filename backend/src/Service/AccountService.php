<?php

namespace App\Service;

use App\Dto\Account\ChangeEmailDto;
use App\Dto\Account\ChangePasswordDto;
use App\Dto\Account\SetJournalPasscodeDto;
use App\Dto\Account\UpdateAccountDto;
use App\Dto\Account\UploadAvatarDto;
use App\Dto\Account\VerifyJournalPasscodeDto;
use App\Entity\AbstractFile;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\File\FileTrait;
use Fagathe\CorePhp\Http\RequestTrait;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Uploader\FileUploadException;
use Fagathe\CorePhp\Uploader\UploaderService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class AccountService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, RequestTrait, FileTrait;

    public function __construct(
        private readonly Security $security,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly UploaderService $uploader,
        private readonly ?string $defaultUri = null,
    ) {}

    public function getBaseUri(): string
    {
        if (!empty($this->defaultUri)) {
            return rtrim($this->defaultUri, '/');
        }

        return rtrim($this->getOrigin(), '/');
    }

    public function formatFileUri(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return sprintf('%s/%s', $this->getBaseUri(), ltrim($path, '/'));
    }

    private function extractRelativePath(?string $urlOrPath): ?string
    {
        if (!$urlOrPath) {
            return null;
        }

        $parsed = parse_url($urlOrPath, PHP_URL_PATH);

        return ltrim($parsed ?: $urlOrPath, '/');
    }

    public function getProfile(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson($user, Response::HTTP_OK, context: ['groups' => ['user.read']]);
    }

    /**
     * PUT /api/account/profile : Mise à jour nom, prénom, username
     */
    public function updateProfile(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var UpdateAccountDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), UpdateAccountDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $cleanUsername = trim($dto->username);
        if ($cleanUsername !== $user->getUsername()) {
            $existing = $this->userRepository->findOneBy(['username' => $cleanUsername]);
            if ($existing && (string) $existing->getId() !== (string) $user->getId()) {
                return $this->sendViolations(['username' => 'Ce nom d\'utilisateur est déjà utilisé.']);
            }
            $user->setUsername($cleanUsername);
        }

        $user->setFirstname($dto->firstname !== null && trim($dto->firstname) !== '' ? trim($dto->firstname) : null);
        $user->setLastname($dto->lastname !== null && trim($dto->lastname) !== '' ? trim($dto->lastname) : null);
        $user->setUpdatedAt($this->now());

        try {
            $this->em->flush();

            return $this->sendJson($user, Response::HTTP_OK, context: ['groups' => ['user.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la mise à jour du profil',
                    'user_id' => (string) $user->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'account.update.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /api/account/email : Mise à jour de l'adresse e-mail (sans mot de passe)
     */
    public function changeEmail(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var ChangeEmailDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), ChangeEmailDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $cleanEmail = strtolower(trim($dto->email));
        if ($cleanEmail !== strtolower((string) $user->getEmail())) {
            $existing = $this->userRepository->findOneBy(['email' => $cleanEmail]);
            if ($existing && (string) $existing->getId() !== (string) $user->getId()) {
                return $this->sendViolations(['email' => 'Cette adresse e-mail est déjà utilisée.']);
            }

            $user->setEmail($cleanEmail);
            $user->setUpdatedAt($this->now());
            $this->em->flush();
        }

        return $this->sendJson($user, Response::HTTP_OK, context: ['groups' => ['user.read']]);
    }

    /**
     * PUT /api/account/password : Mise à jour du mot de passe
     */
    public function changePassword(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var ChangePasswordDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), ChangePasswordDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if (!$this->hasher->isPasswordValid($user, $dto->currentPassword)) {
            return $this->sendJson(['message' => 'Le mot de passe actuel est incorrect.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setPassword($this->hasher->hashPassword($user, $dto->newPassword));
        $user->setUpdatedAt($this->now());
        $this->em->flush();

        return $this->sendJson(['message' => 'Mot de passe modifié avec succès.']);
    }

    /**
     * POST /api/account/avatar : Upload et mise à jour de l'avatar utilisateur
     */
    public function updateAvatar(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $uploadedFile = $request->files->get('avatar') ?? $request->files->get('file');
        $dto = new UploadAvatarDto($uploadedFile);

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        try {
            $oldPath = $this->extractRelativePath($user->getAvatar());

            $uploadResult = $this->uploader
                ->setUploadDirectory('avatars/' . (string) $user->getId())
                ->upload($dto->file, $oldPath);

            $fullAvatarUrl = $this->formatFileUri($uploadResult->relativePath);
            $user->setAvatar($fullAvatarUrl);
            $user->setUpdatedAt($this->now());

            $this->em->flush();

            return $this->sendJson($user, Response::HTTP_OK, context: ['groups' => ['user.read']]);
        } catch (FileUploadException $e) {
            return $this->sendJson(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de l\'upload de l\'avatar',
                    'user_id' => (string) $user->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'account.avatar.update.error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la mise à jour de l\'avatar.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT|PATCH /api/account/journal-passcode : Configuration ou modification du code secret du journal
     */
    public function setJournalPasscode(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var SetJournalPasscodeDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), SetJournalPasscodeDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        // Si un code existe déjà, on vérifie obligatoirement le code actuel
        if ($user->hasJournalPasscode()) {
            if (empty($dto->currentPasscode)) {
                return $this->sendJson(
                    ['message' => 'Le code secret actuel est obligatoire.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            if (!password_verify($dto->currentPasscode, (string) $user->getJournalPasscode())) {
                return $this->sendJson(
                    ['message' => 'Le code secret actuel est incorrect.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        $user->setJournalPasscode(password_hash($dto->passcode, PASSWORD_BCRYPT));
        $user->setJCodeToken(bin2hex(random_bytes(40)));
        $user->setUpdatedAt($this->now());

        $this->em->flush();

        $this->generateLog(
            LoggerLevelEnum::Info,
            [
                'message' => 'Code secret du journal mis à jour',
                'user_id' => (string) $user->getId(),
            ],
            ['action' => 'account.journal_passcode.set']
        );

        return $this->sendJson(
            [
                'user'    => $user,
                'message' => 'Code secret du journal enregistré avec succès.',
            ],
            Response::HTTP_OK,
            context: ['groups' => ['user.read']]
        );
    }

    public function verifyJournalPasscode(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->hasJournalPasscode()) {
            return $this->sendJson(['unlocked' => true, 'message' => 'Aucun code configuré.']);
        }

        try {
            /** @var VerifyJournalPasscodeDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), VerifyJournalPasscodeDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if (!password_verify($dto->passcode, (string) $user->getJournalPasscode())) {
            return $this->sendJson(['message' => 'Code secret incorrect.'], Response::HTTP_FORBIDDEN);
        }

        return $this->sendJson(['unlocked' => true, 'message' => 'Journal déverrouillé.']);
    }

    public function getJournalPasscodeStatus(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson(['hasPasscode' => $user->hasJournalPasscode()]);
    }

    /**
     * DELETE /api/account : Suppression totale du compte et de tous les fichiers physiques sur le disque
     */
    public function deleteAccount(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // 1. Collecte de tous les fichiers attachés (todoFiles, noteFiles, entryMedia)
            /** @var array<string, AbstractFile> $allFiles */
            $allFiles = [];

            foreach ($user->getTodoFiles() as $f) {
                $allFiles[(string) $f->getId()] = $f;
            }
            foreach ($user->getTodos() as $todo) {
                foreach ($todo->getFiles() as $f) {
                    $allFiles[(string) $f->getId()] = $f;
                }
            }

            foreach ($user->getNoteFiles() as $f) {
                $allFiles[(string) $f->getId()] = $f;
            }
            foreach ($user->getNotes() as $note) {
                foreach ($note->getFiles() as $f) {
                    $allFiles[(string) $f->getId()] = $f;
                }
            }

            foreach ($user->getEntryMedia() as $f) {
                $allFiles[(string) $f->getId()] = $f;
            }
            foreach ($user->getEntries() as $entry) {
                foreach ($entry->getEntryMedia() as $f) {
                    $allFiles[(string) $f->getId()] = $f;
                }
            }

            // 2. Suppression physique sur le disque de chaque fichier attaché
            foreach ($allFiles as $file) {
                if ($file->getFilePath()) {
                    $this->uploader->delete((string) $this->extractRelativePath($file->getFilePath()));
                }
            }

            // 3. Suppression physique de l'avatar sur le disque
            if ($user->getAvatar()) {
                $this->uploader->delete((string) $this->extractRelativePath($user->getAvatar()));
            }

            // 4. Suppression en base de données (cascade sur todos, notes, entries, tags, locations)
            $this->userRepository->remove($user, true);

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la suppression du compte',
                    'user_id' => (string) $user->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'account.delete.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression du compte.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }
}
