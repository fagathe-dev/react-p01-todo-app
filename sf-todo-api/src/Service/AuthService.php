<?php

namespace App\Service;

use App\Entity\OTPRequest;
use App\Entity\User;
use App\Enum\Auth\RoleEnum;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Trait\PaginationTrait;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class AuthService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, PaginationTrait;

    public function __construct(
        private readonly Security $security,
        private readonly UserRepository $repository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $hasher,
        PaginatorInterface $paginator,
    ) {
        $this->paginator = $paginator;
    }

    public function register(Request $request): object
    {
        $now = $this->now();

        try {
            /** @var User $user */
            $user = $this->serializer->deserialize(
                $request->getContent(),
                User::class,
                'json',
                [
                    // Protection contre l'usurpation de rôle ou l'auto-validation du compte
                    AbstractNormalizer::IGNORED_ATTRIBUTES => [
                        'id',
                        'roles',
                        'createdAt',
                        'updatedAt',
                        'tags',
                        'todos',
                        'emailVerifiedAt',
                    ],
                ]
            );
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // 1. Validation des contraintes de l'entité (email unique, mot de passe complexe, etc.)
        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        // 2. Hachage du mot de passe et initialisation des valeurs par défaut
        $user
            ->setPassword($this->hasher->hashPassword($user, $user->getPassword()))
            ->setRoles([RoleEnum::RoleUser->value])
            ->setCreatedAt($now)
            ->setEmailVerifiedAt(null);

        // 3. Génération de l'OTP de vérification (code à 6 chiffres, valide 15 minutes)
        $otpCode = (string) random_int(100000, 999999);

        $otpRequest = new OTPRequest();
        $otpRequest
            ->setOwner($user)
            ->setCode($otpCode)
            ->setPurpose('register')
            ->setExpiresAt($now->modify('+15 minutes'));

        // 4. Persistance atomique
        try {
            $this->em->persist($user);
            $this->em->persist($otpRequest);
            $this->em->flush();

            // TODO : Déclencher l'envoi de l'e-mail contenant $otpCode via Symfony Mailer

            return $this->sendJson(
                [
                    'user'    => $user,
                    'message' => 'Compte créé avec succès. Un code de vérification vous a été envoyé par e-mail.',
                ],
                Response::HTTP_CREATED,
                context: ['groups' => ['user.read']]
            );
        } catch (Throwable $e) {
            $message = 'Erreur critique lors de l\'inscription';

            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => $message,
                    'user'    => $user->getUsername(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'user.register.critical_error']
            );

            return $this->sendJson(['message' => $message], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }

    public function deleteAccount(): object
    {
        $user = $this->getAuthenticatedUser();

        if ($user === null) {
            return $this->sendJson(
                ['message' => 'Unauthorized'],
                status: Response::HTTP_UNAUTHORIZED
            );
        }

        try {
            $this->repository->remove($user, true);

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

    public function getProfile(): object
    {
        return $this->sendJson($this->getAuthenticatedUser() ?? null, context: ['groups' => 'user.read']);
    }
}
