<?php

namespace App\Service;

use App\Dto\Todo\CreateTodoCommentDto;
use App\Dto\Todo\CreateTodoDto;
use App\Entity\Tag;
use App\Entity\Todo;
use App\Entity\TodoComment;
use App\Entity\TodoFile;
use App\Entity\User;
use App\Repository\TodoCommentRepository;
use App\Repository\TodoRepository;
use App\Service\AttachmentFileService;
use DateTimeImmutable;
use DateTimeZone;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Uploader\FileUploadException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class TodoService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait;

    public function __construct(
        private readonly Security $security,
        private readonly TodoRepository $repository,
        private readonly TodoCommentRepository $commentRepository,
        private readonly ValidatorInterface $validator,
        private readonly AttachmentFileService $attachmentFileService,
        private readonly SerializerInterface $serializer
    ) {}

    public function findOneTodo(string $id): ?Todo
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    public function listTodos(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->sendJson(
            $user->getTodos(),
            Response::HTTP_OK,
            context: ['groups' => ['todo.list', 'user.read']]
        );
    }

    public function createTodo(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var CreateTodoDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateTodoDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $todo = (new Todo())
            ->setName(trim((string) $dto->name))
            ->setOwner($user)
            ->setIsDone(false);

        try {
            $this->repository->save($todo, flush: true, isCreation: true);

            return $this->sendJson(
                $todo,
                Response::HTTP_CREATED,
                context: ['groups' => ['todo.read', 'user.read']]
            );
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

    public function updateTodo(Todo $todo, Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = $request->request->all();
        if (empty($data)) {
            $data = json_decode($request->getContent(), true) ?? [];
        }

        if (array_key_exists('name', $data) && trim((string) $data['name']) !== '') {
            $todo->setName(trim((string) $data['name']));
        }

        if (array_key_exists('description', $data)) {
            $todo->setDescription($data['description'] !== '' ? $data['description'] : null);
        }

        if (array_key_exists('isDone', $data)) {
            $todo->setIsDone(filter_var($data['isDone'], FILTER_VALIDATE_BOOLEAN));
        }

        if (array_key_exists('dueDate', $data)) {
            if (!empty($data['dueDate'])) {
                try {
                    $todo->setDueDate(new DateTimeImmutable((string) $data['dueDate']));
                    $this->adjustDueDate($todo);
                } catch (Throwable) {
                    return $this->sendJson(['message' => 'Format de date invalide.'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                $todo->setDueDate(null);
            }
        }

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

        $files = $this->extractUploadedFiles($request);
        try {
            foreach ($files as $file) {
                $this->attachmentFileService->upload($file, $todo, $user);
            }
        } catch (FileUploadException $e) {
            return $this->sendJson(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $this->repository->save($todo, flush: true, isCreation: false);

            return $this->sendJson($todo, Response::HTTP_OK, context: ['groups' => ['todo.read', 'file.read']]);
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
            $this->attachmentFileService->deleteByTarget($todo);
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
                ['action' => 'todo.delete.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression du todo.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteTodoFile(Todo $todo, string $fileId): object
    {
        $file = $todo->getFiles()->findFirst(
            fn(int $key, TodoFile $f) => (string) $f->getId() === $fileId
        );

        if (!$file) {
            return $this->sendJson(['message' => 'Fichier introuvable sur cette tâche.'], Response::HTTP_NOT_FOUND);
        }

        $this->attachmentFileService->delete($file);

        return $this->sendNoContent();
    }

    /**
     * POST /api/todos/{id}/comments
     */
    public function addComment(Todo $todo, Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var CreateTodoCommentDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateTodoCommentDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $comment = (new TodoComment())
            ->setContent(trim((string) $dto->content))
            ->setOwner($user)
            ->setTodo($todo);

        try {
            $this->commentRepository->save($comment, flush: true, isCreation: true);

            return $this->sendJson(
                $comment,
                Response::HTTP_CREATED,
                context: ['groups' => ['todo.read', 'user.read']]
            );
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur lors de l\'ajout du commentaire',
                    'todo_id' => (string) $todo->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'todo.comment.create_error']
            );

            return $this->sendJson(['message' => 'Impossible d\'ajouter le commentaire.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /api/todos/{id}/comments/{commentId}
     */
    public function deleteComment(Todo $todo, string $commentId): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $comment = $todo->getComments()->findFirst(
            fn(int $key, TodoComment $c) => (string) $c->getId() === $commentId
        );

        if (!$comment) {
            return $this->sendJson(['message' => 'Commentaire introuvable sur cette tâche.'], Response::HTTP_NOT_FOUND);
        }

        $isAuthor = $comment->getOwner() && (string) $comment->getOwner()->getId() === (string) $user->getId();
        $isTodoOwner = (string) $todo->getOwner()->getId() === (string) $user->getId();

        if (!$isAuthor && !$isTodoOwner) {
            return $this->sendJson(['message' => 'Action non autorisée.'], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->commentRepository->remove($comment, flush: true);

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message'    => 'Erreur lors de la suppression du commentaire',
                    'comment_id' => $commentId,
                    'error'      => $e->getMessage(),
                ],
                ['action' => 'todo.comment.delete_error']
            );

            return $this->sendJson(['message' => 'Impossible de supprimer le commentaire.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function extractUploadedFiles(Request $request): array
    {
        $extracted = [];
        foreach ($request->files->all() as $item) {
            if (is_array($item)) {
                foreach ($item as $nested) {
                    if ($nested instanceof UploadedFile) {
                        $extracted[] = $nested;
                    }
                }
            } elseif ($item instanceof UploadedFile) {
                $extracted[] = $item;
            }
        }

        return $extracted;
    }

    private function assignTagFromPayload(Todo $todo, User $user, mixed $tagId): ?object
    {
        if ($tagId === null || $tagId === '') {
            $todo->setTag(null);
            return null;
        }

        $tag = $user->getTags()->findFirst(
            fn(int $key, Tag $t) => (string) $t->getId() === (string) $tagId
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

    private function adjustDueDate(Todo $todo): void
    {
        if ($todo->getDueDate() !== null) {
            $parisTz = new DateTimeZone('Europe/Paris');
            $todo->setDueDate(
                $todo->getDueDate()
                    ->setTimezone($parisTz)
                    ->setTime(23, 59, 59)
            );
        }
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }
}
