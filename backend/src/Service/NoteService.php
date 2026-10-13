<?php

namespace App\Service;

use App\Dto\Note\CreateNoteDto;
use App\Dto\Note\UpdateNoteDto;
use App\Entity\Note;
use App\Entity\NoteFile;
use App\Entity\Tag;
use App\Entity\User;
use App\Enum\ColorEnum;
use App\Enum\StateEnum;
use App\Repository\NoteRepository;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\Http\ResponseTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Trait\PaginationTrait;
use Fagathe\CorePhp\Uploader\FileUploadException;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class NoteService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, PaginationTrait;

    public function __construct(
        private readonly Security $security,
        private readonly NoteRepository $repository,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly AttachmentFileService $fileService,
        PaginatorInterface $paginator,
    ) {
        $this->paginator = $paginator;
    }

    public function findOneNote(string $id): ?Note
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    /**
     * Liste des notes selon le filtre ('open', 'archived', 'trash')
     */
    public function listNotes(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $filter = $request->query->get('filter', 'open');

        $qb = $this->repository->createQueryBuilder('n')
            ->andWhere('n.owner = :ownerId')
            ->setParameter('ownerId', $user->getId(), UuidType::NAME)
            ->orderBy('n.created_at', 'DESC');

        if ($filter === 'trash') {
            $qb->andWhere('n.deleted_at IS NOT NULL AND n.state = :trashState')
                ->setParameter('trashState', StateEnum::Trash->value);
        } elseif ($filter === 'archived') {
            $qb->andWhere('n.deleted_at IS NULL')
                ->andWhere('n.state = :archivedState')
                ->setParameter('archivedState', StateEnum::Archieved->value);
        } else {
            $qb->andWhere('n.deleted_at IS NULL')
                ->andWhere('n.state = :openState')
                ->setParameter('openState', StateEnum::Open->value);
        }

        $notes = $qb->getQuery()->getResult();

        return $this->sendJson($notes, Response::HTTP_OK, context: ['groups' => ['note.list',]]);
    }

    public function createNote(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var CreateNoteDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateNoteDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format de données JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $note = new Note();
        $note->setTitle($dto->title ?? '');
        $note->setContent($dto->content);
        $note->setOwner($user);
        $note->setState(StateEnum::Open);

        if ($dto->color) {
            $note->setColor($dto->color);
        }

        if ($dto->tag) {
            $tagError = $this->assignTagFromId($note, $user, $dto->tag);
            if ($tagError) {
                return $tagError;
            }
        }

        try {
            $this->repository->save($note, flush: true, isCreation: true);

            return $this->sendJson($note, Response::HTTP_CREATED, context: ['groups' => ['note.read', 'tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur création note', 'user' => $user->getUserIdentifier(), 'error' => $e->getMessage()],
                ['action' => 'note.create.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la création.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateNote(Note $note, Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = $request->request->all();
        if (empty($data)) {
            $data = json_decode($request->getContent(), true) ?? [];
        }

        $dto = new UpdateNoteDto();
        $dto->title = $data['title'] ?? null;
        $dto->content = $data['content'] ?? null;
        $dto->color = $data['color'] ?? null;
        $dto->state = $data['state'] ?? null;
        $dto->tag = $data['tag'] ?? null;

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if (array_key_exists('title', $data)) {
            $note->setTitle(trim((string) $data['title']));
        }
        if (array_key_exists('content', $data)) {
            $note->setContent($data['content'] !== '' ? $data['content'] : null);
        }
        if (array_key_exists('color', $data)) {
            $note->setColor($data['color'] ?: null);
        }
        if (!empty($data['state'])) {
            $note->setState($data['state']);
        }
        if (array_key_exists('tag', $data)) {
            $tagError = $this->assignTagFromId($note, $user, $data['tag']);
            if ($tagError) {
                return $tagError;
            }
        }

        if (array_key_exists('isPinned', $data)) {
            $note->setIsPinned(filter_var($data['isPinned'], FILTER_VALIDATE_BOOLEAN));
        }

        $files = $this->extractUploadedFiles($request);
        try {
            foreach ($files as $file) {
                $this->fileService->upload($file, $note, $user);
            }
        } catch (FileUploadException $e) {
            return $this->sendJson(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $this->repository->save($note, flush: true, isCreation: false);

            return $this->sendJson($note, Response::HTTP_OK, context: ['groups' => ['note.read', 'tag.read', 'file.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur mise à jour note', 'note_id' => (string) $note->getId(), 'error' => $e->getMessage()],
                ['action' => 'note.update.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la mise à jour.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Restaure une note depuis la corbeille ou les archives vers l'état actif
     */
    public function restoreNote(Note $note): object
    {
        $note->setDeletedAt(null);
        $note->setState(StateEnum::Open);

        try {
            $this->repository->save($note, flush: true, isCreation: false);

            return $this->sendJson($note, Response::HTTP_OK, context: ['groups' => ['note.read', 'tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur restauration note', 'note_id' => (string) $note->getId(), 'error' => $e->getMessage()],
                ['action' => 'note.restore.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la restauration.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteNote(Note $note, bool $permanent = false): object
    {
        try {
            if ($permanent) {
                $this->fileService->deleteByTarget($note);
                $this->repository->remove($note, true);
            } else {
                $note->setDeletedAt($this->now());
                $note->setState(StateEnum::Trash);
                $this->repository->save($note, flush: true, isCreation: false);
            }

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur suppression note', 'note_id' => (string) $note->getId(), 'error' => $e->getMessage()],
                ['action' => 'note.delete.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteNoteFile(Note $note, string $fileId): object
    {
        $file = $note->getFiles()->findFirst(
            fn(int $key, NoteFile $f) => (string) $f->getId() === $fileId
        );

        if (!$file) {
            return $this->sendJson(['message' => 'Fichier introuvable sur cette note.'], Response::HTTP_NOT_FOUND);
        }

        $this->fileService->delete($file);

        return $this->sendNoContent();
    }

    private function assignTagFromId(Note $note, User $user, mixed $tagId): ?object
    {
        if ($tagId === null || $tagId === '') {
            $note->setTag(null);
            return null;
        }

        $tag = $user->getTags()->findFirst(
            fn(int $key, Tag $t) => (string) $t->getId() === (string) $tagId
        );

        if (!$tag) {
            return $this->sendJson(['message' => 'Tag invalide ou non autorisé.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $note->setTag($tag);
        return null;
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

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->security->getUser();
        return $user instanceof User ? $user : null;
    }

    /**
     * Supprime définitivement toutes les notes de l'utilisateur dans la corbeille ainsi que leurs fichiers.
     */
    public function emptyTrash(): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $notes = $this->repository->createQueryBuilder('n')
            ->andWhere('n.owner = :ownerId')
            ->andWhere('(n.deleted_at IS NOT NULL OR n.state = :trashState)')
            ->setParameter('ownerId', $user->getId(), UuidType::NAME)
            ->setParameter('trashState', StateEnum::Trash)
            ->getQuery()
            ->getResult();

        try {
            foreach ($notes as $note) {
                // Suppression physique des fichiers sur le disque puis de l'entité
                $this->fileService->deleteByTarget($note);
                $this->repository->remove($note, true);
            }

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                [
                    'message' => 'Erreur critique lors du vidage de la corbeille',
                    'user_id' => (string) $user->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'note.empty_trash.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors du vidage de la corbeille.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
