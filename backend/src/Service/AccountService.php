<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\RequestTrait;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class AccountService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, RequestTrait;

    public function __construct(
        private readonly Security $security,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $hasher,
    ) {}

    public function getProfile(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson($user, Response::HTTP_OK, context: ['groups' => ['user.read']]);
    }

    public function updateProfile(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $this->serializer->deserialize(
                $request->getContent(),
                User::class,
                'json',
                [
                    AbstractNormalizer::OBJECT_TO_POPULATE => $user,
                    AbstractNormalizer::IGNORED_ATTRIBUTES => [
                        'id',
                        'email',
                        'roles',
                        'password',
                        'createdAt',
                        'updatedAt',
                        'tags',
                        'todos',
                        'emailVerifiedAt',
                        'isVerified',
                    ],
                ]
            );
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

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
            $this->userRepository->remove($user, true);

            $this->generateLog(
                LoggerLevelEnum::Info,
                [
                    'message'    => 'Compte utilisateur supprimé avec succès',
                    'user_id'    => (string) $user->getId(),
                    'user_agent' => $this->getUserAgent(),
                ],
                ['action' => 'account.delete.success']
            );

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