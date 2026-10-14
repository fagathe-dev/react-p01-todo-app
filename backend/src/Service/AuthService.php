<?php

namespace App\Service;

use App\Entity\User;
use App\Enum\Auth\RoleEnum;
use App\Enum\Auth\UserRequestTypeEnum;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Generator\TokenGenerator;
use Fagathe\CorePhp\Http\RequestTrait;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class AuthService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, RequestTrait;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly UserRequestService $userRequestService,
        private readonly TokenGenerator $tokenGenerator
    ) {}

    /**
     * Inscription d'un nouvel utilisateur et envoi d'OTP
     */
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
                    AbstractNormalizer::IGNORED_ATTRIBUTES => [
                        'id',
                        'roles',
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

        // Validation des contraintes de l'entité
        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $user
            ->setPassword($this->hasher->hashPassword($user, $user->getPassword()))
            ->setRoles([RoleEnum::RoleUser->value])
            ->setCreatedAt($now)
            ->setIsVerified(false)
            ->setJCodeToken($this->tokenGenerator->generate(80));

        try {
            $this->em->persist($user);
            $this->em->flush();

            // Création de l'OTP de validation via le service générique
            $otpRequest = $this->userRequestService->createRequest(
                $user,
                UserRequestTypeEnum::OtpRegister,
                ttlMinutes: 15,
                isOtp: true
            );

            // TODO : Expédition e-mail avec $otpRequest->getCode()

            return $this->sendJson(
                [
                    'user'    => $user,
                    'message' => 'Compte créé avec succès. Un code de confirmation vous a été envoyé.',
                ],
                Response::HTTP_CREATED,
                context: ['groups' => ['user.read']]
            );
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message'    => 'Erreur critique lors de l\'inscription',
                    'user'       => $user->getUsername(),
                    'user_agent' => $this->getUserAgent(),
                    'error'      => $e->getMessage(),
                ],
                ['action' => 'user.register.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la création du compte.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Vérification de l'adresse e-mail par code OTP
     */
    public function verifyOtp(Request $request): object
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $code = trim((string) ($data['code'] ?? ''));

        if (empty($code)) {
            return $this->sendJson(['message' => 'Le code OTP est obligatoire.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $userRequest = $this->userRequestService->findValidRequest($code, UserRequestTypeEnum::OtpRegister);

        if (!$userRequest) {
            return $this->sendJson(['message' => 'Code de vérification invalide ou expiré.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRequest->getUser();
        $user->setIsVerified(true);
        $user->setEmailVerifiedAt($this->now());

        $this->userRequestService->consume($userRequest);

        return $this->sendJson([
            'message' => 'Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter.',
        ]);
    }

    /**
     * Demande de réinitialisation de mot de passe (génération d'un token sécurisé)
     */
    public function forgotPassword(Request $request): object
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = trim((string) ($data['email'] ?? ''));

        if (empty($email)) {
            return $this->sendJson(['message' => 'L\'adresse e-mail est obligatoire.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);

        if ($user) {
            $userRequest = $this->userRequestService->createRequest(
                $user,
                UserRequestTypeEnum::PasswordReset,
                ttlMinutes: 30,
                isOtp: false
            );

            // TODO : Envoyer l'e-mail avec le lien contenant $userRequest->getToken()
        }

        // Réponse constante pour empêcher l'énumération d'utilisateurs
        return $this->sendJson([
            'message' => 'Si cette adresse existe, un lien de réinitialisation vous a été envoyé.',
        ]);
    }

    /**
     * Réinitialisation effective du mot de passe avec le token
     */
    public function resetPassword(Request $request): object
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $token = trim((string) ($data['token'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if (empty($token) || empty($password)) {
            return $this->sendJson(['message' => 'Jeton et nouveau mot de passe obligatoires.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $userRequest = $this->userRequestService->findValidRequest($token, UserRequestTypeEnum::PasswordReset);

        if (!$userRequest) {
            return $this->sendJson(['message' => 'Le lien de réinitialisation est invalide ou a expiré.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRequest->getUser();
        $user->setPassword($this->hasher->hashPassword($user, $password));
        $user->setUpdatedAt($this->now());

        $this->userRequestService->consume($userRequest);

        return $this->sendJson(['message' => 'Votre mot de passe a été réinitialisé avec succès.']);
    }
}
