<?php

namespace App\Service;

use App\Dto\Tag\CreateTagDto;
use App\Dto\Tag\UpdateTagDto;
use App\Entity\Tag;
use App\Entity\User;
use App\Repository\TagRepository;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Trait\PaginationTrait;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class TagService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, PaginationTrait;

    public function __construct(
        private readonly Security $security,
        private readonly TagRepository $repository,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        PaginatorInterface $paginator,
    ) {
        $this->paginator = $paginator;
    }

    public function findOneTag(string $id): ?Tag
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    public function listTags(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson($user->getTags(), Response::HTTP_OK, context: ['groups' => ['tag.list']]);
    }

    public function createTag(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var CreateTagDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateTagDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if ($this->repository->colorExistsForUser($user, $dto->color)) {
            return $this->sendViolations(['color' => 'Vous possédez déjà un tag avec cette couleur.']);
        }

        $tag = new Tag();
        $tag->setName($dto->name)
            ->setColor($dto->color)
            ->setDescription($dto->description)
            ->setOwner($user);

        try {
            $this->repository->save($tag, flush: true, isCreation: true);
            return $this->sendJson($tag, Response::HTTP_CREATED, context: ['groups' => ['tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur critique création tag', 'user' => $user->getUserIdentifier(), 'error' => $e->getMessage()],
                ['action' => 'tag.create.critical_error']
            );
            return $this->sendJson(['message' => 'Erreur interne.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateTag(Tag $tag, Request $request): object
    {
        try {
            /** @var UpdateTagDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), UpdateTagDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if ($dto->color && $dto->color !== $tag->getColor()?->value) {
            if ($this->repository->colorExistsForUser($tag->getOwner(), $dto->color, $tag->getId())) {
                return $this->sendViolations(['color' => 'Vous possédez déjà un tag avec cette couleur.']);
            }
            $tag->setColor($dto->color);
        }

        if ($dto->name !== null) $tag->setName($dto->name);
        if (array_key_exists('description', json_decode($request->getContent(), true))) {
            $tag->setDescription($dto->description);
        }

        try {
            $this->repository->save($tag, flush: true, isCreation: false);
            return $this->sendJson($tag, Response::HTTP_OK, context: ['groups' => ['tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur critique MAJ tag', 'tag_id' => (string) $tag->getId(), 'error' => $e->getMessage()],
                ['action' => 'tag.update.critical_error']
            );
            return $this->sendJson(['message' => 'Erreur interne.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteTag(Tag $tag): object
    {
        try {
            $this->repository->remove($tag, true);
            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur critique suppression tag', 'tag_id' => (string) $tag->getId(), 'error' => $e->getMessage()],
                ['action' => 'tag.delete.critical_error']
            );
            return $this->sendJson(['message' => 'Erreur interne.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();
        return $user instanceof User ? $user : null;
    }
}