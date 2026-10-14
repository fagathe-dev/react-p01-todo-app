<?php

namespace App\Service;

use App\Dto\Journal\CreateJournalDto;
use App\Dto\Journal\UpdateJournalDto;
use App\Entity\Entry;
use App\Entity\Tag;
use App\Entity\User;
use App\Enum\ColorEnum;
use App\Enum\MoodEnum;
use App\Repository\EntryRepository;
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
use Symfony\Component\String\Slugger\AsciiSlugger;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Throwable;

final class JournalService
{
    use ResponseTrait, DatetimeTrait, LoggerTrait, PaginationTrait;

    public function __construct(
        private readonly Security $security,
        private readonly EntryRepository $repository,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly AttachmentFileService $fileService,
        PaginatorInterface $paginator,
    ) {
        $this->paginator = $paginator;
    }

    public function findOneEntry(string $id): ?Entry
    {
        return $this->repository->findOneBy(['id' => $id]);
    }

    /**
     * Liste chronologique des entrées du journal pour l'utilisateur connecté.
     */
    public function listEntries(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $qb = $this->repository->createQueryBuilder('e')
            ->andWhere('e.owner = :ownerId')
            ->setParameter('ownerId', $user->getId(), UuidType::NAME)
            ->orderBy('e.created_at', 'DESC');

        $entries = $qb->getQuery()->getResult();

        return $this->sendJson($entries, Response::HTTP_OK, context: ['groups' => ['entry.list', 'tag.list', 'file.read']]);
    }

    /**
     * Récupère une entrée avec ses détails complets (médias et tags inclus).
     */
    public function showEntry(Entry $entry): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user || $entry->getOwner() !== $user) {
            return $this->sendJson(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        return $this->sendJson($entry, Response::HTTP_OK, context: ['groups' => ['entry.read', 'tag.read', 'file.read']]);
    }

    public function createEntry(Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return $this->sendJson(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var CreateJournalDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateJournalDto::class, 'json');
        } catch (Throwable) {
            return $this->sendJson(['message' => 'Format JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        $entry = new Entry();
        $entry->setTitle($dto->title ? trim($dto->title) : null);
        $entry->setContent($dto->content ? trim($dto->content) : null);
        $entry->setOwner($user);
        $entry->setCreatedAt($this->now());
        $entry->setIsPinned((bool) $dto->isPinned);

        if ($dto->color) {
            $entry->setColor(ColorEnum::tryFrom($dto->color));
        }

        if ($dto->mood) {
            $entry->setMood(MoodEnum::tryFrom($dto->mood));
        }

        if ($entry->getTitle()) {
            $slugger = new AsciiSlugger();
            $entry->setSlug($slugger->slug($entry->getTitle())->lower()->toString());
        }

        if ($dto->location) {
            $this->assignLocationFromPayload($entry, $user, $dto->location);
        }

        if ($dto->tag) {
            $tagError = $this->assignTagFromId($entry, $user, $dto->tag);
            if ($tagError) {
                return $tagError;
            }
        }

        try {
            $this->repository->save($entry, flush: true, isCreation: true);

            return $this->sendJson($entry, Response::HTTP_CREATED, context: ['groups' => ['entry.read', 'tag.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur création entrée journal', 'user' => $user->getUserIdentifier(), 'error' => $e->getMessage()],
                ['action' => 'journal.create.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la création.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateEntry(Entry $entry, Request $request): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user || $entry->getOwner() !== $user) {
            return $this->sendJson(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $data = $request->request->all();
        if (empty($data)) {
            $data = json_decode($request->getContent(), true) ?? [];
        }

        $dto = new UpdateJournalDto();
        $dto->title = $data['title'] ?? null;
        $dto->content = $data['content'] ?? null;
        $dto->color = $data['color'] ?? null;
        $dto->mood = $data['mood'] ?? null;
        $dto->tag = $data['tag'] ?? null;
        $dto->isPinned = isset($data['isPinned']) ? filter_var($data['isPinned'], FILTER_VALIDATE_BOOLEAN) : null;

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            return $this->sendViolations($violations);
        }

        if (array_key_exists('title', $data)) {
            $entry->setTitle(trim((string) $data['title']) ?: null);
            if ($entry->getTitle()) {
                $slugger = new AsciiSlugger();
                $entry->setSlug($slugger->slug($entry->getTitle())->lower()->toString());
            }
        }

        if (array_key_exists('content', $data)) {
            $entry->setContent(trim((string) $data['content']) ?: null);
        }

        if (array_key_exists('color', $data)) {
            $entry->setColor($data['color'] ? ColorEnum::tryFrom((string) $data['color']) : null);
        }

        if (array_key_exists('mood', $data)) {
            $entry->setMood($data['mood'] ? MoodEnum::tryFrom((string) $data['mood']) : null);
        }

        if ($dto->isPinned !== null) {
            $entry->setIsPinned($dto->isPinned);
        }

        if (array_key_exists('tag', $data)) {
            $tagError = $this->assignTagFromId($entry, $user, $data['tag']);
            if ($tagError) {
                return $tagError;
            }
        }

        if (array_key_exists('location', $data)) {
            $loc = is_string($data['location']) ? json_decode($data['location'], true) : $data['location'];
            $this->assignLocationFromPayload($entry, $user, is_array($loc) ? $loc : null);
        }

        // Suppression des médias existants cochés pour suppression
        $deletedMediaIds = $data['deleted_medias'] ?? $data['deletedMedias'] ?? [];
        if (is_array($deletedMediaIds) && count($deletedMediaIds) > 0) {
            foreach ($entry->getEntryMedia()->toArray() as $media) {
                if (in_array((string) $media->getId(), $deletedMediaIds, true)) {
                    $entry->removeEntryMedium($media);
                    $this->fileService->delete($media);
                }
            }
        }

        $entry->setUpdatedAt($this->now());

        // Upload de nouveaux médias (images, vidéos, audios)
        $files = $this->extractUploadedFiles($request);
        try {
            foreach ($files as $file) {
                /** @var \App\Entity\EntryMedia $media */
                $media = $this->fileService->upload($file, $entry, $user);
                $entry->addEntryMedium($media);
            }
        } catch (FileUploadException $e) {
            return $this->sendJson(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $this->repository->save($entry, flush: true, isCreation: false);

            return $this->sendJson($entry, Response::HTTP_OK, context: ['groups' => ['entry.read', 'tag.read', 'file.read']]);
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur modification entrée journal', 'id' => (string) $entry->getId(), 'error' => $e->getMessage()],
                ['action' => 'journal.update.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la modification.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Suppression définitive (Hard delete) de l'entrée et de ses fichiers physiques.
     */
    public function deleteEntry(Entry $entry): object
    {
        $user = $this->getAuthenticatedUser();
        if (!$user || $entry->getOwner() !== $user) {
            return $this->sendJson(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        try {
            // Suppression des fichiers physiques sur le disque
            $this->fileService->deleteByTarget($entry);

            // Suppression définitive de l'entité en base
            $this->repository->remove($entry, flush: true);

            return $this->sendNoContent();
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Critical,
                ['message' => 'Erreur suppression définitive journal', 'id' => (string) $entry->getId(), 'error' => $e->getMessage()],
                ['action' => 'journal.delete.critical_error']
            );

            return $this->sendJson(['message' => 'Erreur interne lors de la suppression.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function assignLocationFromPayload(Entry $entry, User $user, ?array $locData): void
    {
        if (empty($locData) || !isset($locData['latitude'], $locData['longitude'])) {
            $entry->setLocation(null);
            return;
        }

        $location = $entry->getLocation() ?? new \App\Entity\Location();
        $location->setOwner($user);
        $location->setLatitude((float) $locData['latitude']);
        $location->setLongitude((float) $locData['longitude']);
        $location->setName(
            !empty($locData['name'])
                ? (string) $locData['name']
                : sprintf('%s, %s', $locData['latitude'], $locData['longitude'])
        );
        $location->setStreet(isset($locData['street']) ? (string) $locData['street'] : null);
        $location->setCity(isset($locData['city']) ? (string) $locData['city'] : null);
        $location->setCountry(isset($locData['country']) ? (string) $locData['country'] : null);

        if (!$location->getCreatedAt()) {
            $location->setCreatedAt($this->now());
        } else {
            $location->setUpdatedAt($this->now());
        }

        $entry->setLocation($location);
    }

    private function assignTagFromId(Entry $entry, User $user, mixed $tagId): ?object
    {
        if ($tagId === null || $tagId === '') {
            $entry->setTag(null);
            return null;
        }

        $tag = $user->getTags()->findFirst(
            fn(int $key, Tag $t) => (string) $t->getId() === (string) $tagId
        );

        if (!$tag) {
            return $this->sendJson(['message' => 'Tag invalide ou non autorisé.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $entry->setTag($tag);
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
}
