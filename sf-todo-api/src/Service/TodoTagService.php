<?php

namespace App\Service;

use App\Entity\TodoTag;
use App\Entity\User;
use App\Repository\TodoTagRepository;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Trait\PaginationTrait;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class TodoTagService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, PaginationTrait;

    public function __construct(
        private readonly Security $security,
        private readonly TodoTagRepository $repository,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        PaginatorInterface $paginator,
    ) {
        $this->paginator = $paginator;
    }

    public function findOneTag(string $id): ?TodoTag
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    /**
     * Liste les tags de l'utilisateur authentifié
     */
    public function listTags(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }


        $tags = $user->getTags();

        return $this->sendJson($tags, Response::HTTP_OK, context: ['groups' => ['tag.list']]);
    }

    /**
     * Crée un nouveau tag rattaché à l'utilisateur connecté
     */
    public function createTag(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var TodoTag $tag */
            $tag = $this->serializer->deserialize(
                $request->getContent(),
                TodoTag::class,
                'json',
                [
                    AbstractNormalizer::IGNORED_ATTRIBUTES => ['id', 'owner', 'createdAt', 'updatedAt', 'todos'],
                ]
            );
        } catch (Throwable $e) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // Assignation automatique du propriétaire
        $tag->setOwner($user);

        // Validation des règles métier (nom obligatoire, couleur valide selon TagColorEnum)
        $violations = $this->validator->validate($tag);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        // Vérification de l'unicité de la couleur par utilisateur
        if ($tag->getColor() !== null && $this->repository->colorExistsForUser($user, $tag->getColor())) {
            return $this->sendViolations(
                ['color' => 'Vous possédez déjà un tag avec cette couleur.'],
            );
        }

        try {
            $this->repository->save($tag, flush: true, isCreation: true);

            return $this->sendJson($tag, Response::HTTP_CREATED, context: ['groups' => ['tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la création du tag',
                    'user'    => $user->getUserIdentifier(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'tag.create.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la création du tag.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Met à jour un tag existant après validation
     */
    public function updateTag(TodoTag $tag, Request $request): object
    {
        try {
            $this->serializer->deserialize(
                $request->getContent(),
                TodoTag::class,
                'json',
                [
                    AbstractNormalizer::OBJECT_TO_POPULATE => $tag,
                    AbstractNormalizer::IGNORED_ATTRIBUTES => ['id', 'owner', 'createdAt', 'updatedAt', 'todos'],
                ]
            );
        } catch (Throwable $e) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($tag);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        // Vérification de l'unicité de la couleur par utilisateur
        if ($tag->getColor() !== null && $this->repository->colorExistsForUser($tag->getOwner(), $tag->getColor(), $tag->getId())) {
            return $this->sendViolations(
                ['color' => 'Vous possédez déjà un tag avec cette couleur.'],
            );
        }

        try {
            $this->repository->save($tag, flush: true, isCreation: false);

            return $this->sendJson($tag, Response::HTTP_OK, context: ['groups' => ['tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la mise à jour du tag',
                    'tag_id'  => (string) $tag->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'tag.update.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la mise à jour du tag.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // src/Service/TodoTagService.php

    public function deleteTag(TodoTag $tag): object
    {
        try {
            $this->repository->remove($tag, true);

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la suppression du tag',
                    'tag_id'  => (string) $tag->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'tag.delete.critical_error'] // Remplacer tag.update par tag.delete
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression du tag.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }
}
