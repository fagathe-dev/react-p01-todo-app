<?php

namespace App\Service;

use App\Dto\Account\SetJournalPasscodeDto;
use App\Dto\Account\UpdateAccountDto;
use App\Dto\Account\UploadAvatarDto;
use App\Dto\Account\VerifyJournalPasscodeDto;
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

    /**
     * Retourne l'URI de base absolue pour préfixer les fichiers
     */
    public function getBaseUri(): string
    {
        if (!empty($this->defaultUri)) {
            return rtrim($this->defaultUri, '/');
        }

        return rtrim($this->getOrigin(), '/');
    }

    /**
     * Préfixe le chemin avec defaultURI pour l'accès front
     */
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

    /**
     * Extrait le chemin relatif physique d'un fichier à partir d'une URL absolue
     */
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
     * PUT /api/account/profile : Mise à jour des informations de compte
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

        // Contrôle d'unicité sur le pseudonyme s'il a changé
        if ($dto->username !== $user->getUsername()) {
            $existing = $this->userRepository->findOneBy(['username' => $dto->username]);
            if ($existing && (string) $existing->getId() !== (string) $user->getId()) {
                return $this->sendViolations(['username' => 'Ce nom d\'utilisateur est déjà utilisé.']);
            }
            $user->setUsername($dto->username);
        }

        $user->setFirstname($dto->firstname !== '' ? $dto->firstname : null);
        $user->setLastname($dto->lastname !== '' ? $dto->lastname : null);
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
            // Nettoyage de l'ancien avatar sur disque
            $oldPath = $this->extractRelativePath($user->getAvatar());

            $uploadResult = $this->uploader
                ->setUploadDirectory('avatars/' . (string) $user->getId())
                ->upload($dto->file, $oldPath);

            // Préfixage avec defaultURI
            $fullAvatarUrl = $this->formatFileUri($uploadResult->relativePath);
            $user->setAvatar($fullAvatarUrl);
            $user->setUpdatedAt($this->now());

            $this->em->flush();

            $this->generateLog(
                LoggerLevelEnum::Info,
                [
                    'message'    => 'Avatar mis à jour',
                    'user_id'    => (string) $user->getId(),
                    'avatar_url' => $fullAvatarUrl,
                    'size'       => $this->formatFileSize($uploadResult->size),
                ],
                ['action' => 'account.avatar.update.success']
            );

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
     * PUT /api/account/journal-passcode : Configuration ou modification du code secret du journal
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

        $user->setJournalPasscode(password_hash($dto->passcode, PASSWORD_BCRYPT));
        $user->setUpdatedAt($this->now());
        $this->em->flush();

        $this->generateLog(
            LoggerLevelEnum::Info,
            [
                'message' => 'Code secret du journal configuré',
                'user_id' => (string) $user->getId(),
            ],
            ['action' => 'account.journal_passcode.set']
        );

        return $this->sendJson(['message' => 'Code secret du journal configuré avec succès.']);
    }

    /**
     * POST /api/account/journal-passcode/verify : Vérification du code pour le front
     */
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

        if (!password_verify($dto->passcode, $user->getJournalPasscode())) {
            return $this->sendJson(['message' => 'Code secret incorrect.'], Response::HTTP_FORBIDDEN);
        }

        return $this->sendJson(['unlocked' => true, 'message' => 'Journal déverrouillé.']);
    }

    /**
     * GET /api/account/journal-passcode/status : État de configuration du code
     */
    public function getJournalPasscodeStatus(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson(['hasPasscode' => $user->hasJournalPasscode()]);
    }

    public function changePassword(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $currentPassword = (string) ($data['currentPassword'] ?? '');
        $newPassword = (string) ($data['newPassword'] ?? '');

        if (!$this->hasher->isPasswordValid($user, $currentPassword)) {
            return $this->sendJson(['message' => 'Le mot de passe actuel est incorrect.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setPassword($this->hasher->hashPassword($user, $newPassword));
        $user->setUpdatedAt($this->now());

        $violations = $this->validator->validateProperty($user, 'password');
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $this->em->flush();

        return $this->sendJson(['message' => 'Mot de passe modifié avec succès.']);
    }

    public function deleteAccount(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // Nettoyage de l'avatar physique si présent
            if ($user->getAvatar()) {
                $this->uploader->delete((string) $this->extractRelativePath($user->getAvatar()));
            }

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
