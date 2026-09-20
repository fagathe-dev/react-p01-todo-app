<?php

namespace App\Service;

use App\Entity\Todo;
use App\Entity\TodoTag;
use App\Entity\User;
use App\Repository\TodoRepository;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class TodoService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait;

    public function __construct(
        private readonly Security $security,
        private readonly TodoRepository $repository,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
    ) {}

    public function findOneTodo(string $id): ?Todo
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    /**
     * Liste les todos de l'utilisateur authentifié
     */
    public function listTodos(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson($user->getTodos(), Response::HTTP_OK, context: ['groups' => ['todo.list']]);
    }

    /**
     * Crée un nouveau todo rattaché à l'utilisateur connecté
     */
    public function createTodo(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!is_array($data)) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            /** @var Todo $todo */
            $todo = $this->serializer->deserialize(
                $content,
                Todo::class,
                'json',
                [
                    AbstractNormalizer::IGNORED_ATTRIBUTES => ['id', 'owner', 'createdAt', 'updatedAt', 'tag'],
                ]
            );
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $todo->setOwner($user);

        // Rattachement du tag si fourni
        if (array_key_exists('tag', $data)) {
            $tagError = $this->assignTagFromPayload($todo, $user, $data['tag']);
            if ($tagError) {
                return $tagError;
            }
        }

        $violations = $this->validator->validate($todo);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        try {
            $this->repository->save($todo, flush: true, isCreation: true);

            return $this->sendJson($todo, Response::HTTP_CREATED, context: ['groups' => ['todo.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la création du todo',
                    'user'    => $user->getUserIdentifier(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'todo.create.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la création du todo.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Met à jour un todo existant après validation
     */
    public function updateTodo(Todo $todo, Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!is_array($data)) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->serializer->deserialize(
                $content,
                Todo::class,
                'json',
                [
                    AbstractNormalizer::OBJECT_TO_POPULATE => $todo,
                    AbstractNormalizer::IGNORED_ATTRIBUTES => ['id', 'owner', 'createdAt', 'updatedAt', 'tag'],
                ]
            );
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // Mise à jour du tag si la clé est présente dans le payload
        if (array_key_exists('tag', $data)) {
            $tagError = $this->assignTagFromPayload($todo, $user, $data['tag']);
            if ($tagError) {
                return $tagError;
            }
        }

        $violations = $this->validator->validate($todo);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        try {
            $this->repository->save($todo, flush: true, isCreation: false);

            return $this->sendJson($todo, Response::HTTP_OK, context: ['groups' => ['todo.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la mise à jour du todo',
                    'todo_id' => (string) $todo->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'todo.update.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la mise à jour du todo.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteTodo(Todo $todo): object
    {
        try {
            $this->repository->remove($todo, true);

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors de la suppression du todo',
                    'todo_id' => (string) $todo->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'todo.delete.critical_error'] // Corrigé
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression du todo.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Recherche et assigne le tag appartenant à l'utilisateur
     */
    private function assignTagFromPayload(Todo $todo, User $user, mixed $tagId): ?object
    {
        if ($tagId === null || $tagId === '') {
            $todo->setTag(null);
            return null;
        }

        $tag = $user->getTags()->findFirst(
            fn(int $key, TodoTag $t) => (string) $t->getId() === (string) $tagId
        );

        if (!$tag) {
            return $this->sendJson(
                ['message' => 'Ce tag n\'existe pas ou ne vous appartient pas.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $todo->setTag($tag);
        return null;
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }
}
