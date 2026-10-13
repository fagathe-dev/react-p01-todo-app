<?php

namespace App\Service;

use App\Entity\AbstractFile;
use App\Entity\Entry;
use App\Entity\EntryMedia;
use App\Entity\Note;
use App\Entity\NoteFile;
use App\Entity\Todo;
use App\Entity\TodoFile;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\File\FileTrait;
use Fagathe\CorePhp\File\MimeType;
use Fagathe\CorePhp\Http\RequestTrait;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Uploader\FileUploadException;
use Fagathe\CorePhp\Uploader\UploaderService;
use Fagathe\CorePhp\Uploader\UploaderValidationService;
use InvalidArgumentException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Throwable;

final class AttachmentFileService
{
    use LoggerTrait, DatetimeTrait, FileTrait, RequestTrait;

    private const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo


    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UploaderService $uploader,
        private readonly ?string $defaultUri,
        private readonly Security $security,
    ) {}

    /**
     * Valide et uploade un fichier pour une entité Todo, Note ou Entry.
     *
     * @throws FileUploadException
     */
    public function upload(UploadedFile $file, Todo|Note|Entry $target, User $user): AbstractFile
    {
        // 1. Définition des règles selon la cible
        [$allowedMimes, $subDir] = match (true) {
            $target instanceof Entry => [
                [...MimeType::IMAGE_MIMES, ...MimeType::AUDIO_MIMES, ...MimeType::VIDEO_MIMES],
                'entries/' . (string) $user->getId(),
            ],
            $target instanceof Note => [
                MimeType::getSupportedMimetypes(),
                'notes/' . (string) $user->getId(),
            ],
            $target instanceof Todo => [
                MimeType::getSupportedMimetypes(),
                'todos/' . (string) $user->getId(),
            ],
            default => throw new InvalidArgumentException('Type de cible non pris en charge.'),
        };

        // 2. Validation
        $validator = new UploaderValidationService();
        $validator->setAllowedMimeTypes($allowedMimes)->setMaxSize(self::MAX_SIZE);

        $result = $validator->validate($file);
        if ($result !== true && is_array($result)) {
            throw new FileUploadException(implode(' ', $result));
        }

        // 3. Déplacement sur disque
        $uploadResult = $this->uploader
            ->setUploadDirectory($subDir)
            ->upload($file);

        // 4. Instanciation de la bonne entité
        $attachment = match (true) {
            $target instanceof Entry => (new EntryMedia())->setEntry($target),
            $target instanceof Note  => (new NoteFile())->setNote($target),
            $target instanceof Todo  => (new TodoFile())->setTodo($target),
        };

        $attachment
            ->setOriginalName($uploadResult->originalName)
            ->setFilePath($this->formatFileUri($uploadResult->relativePath))
            ->setMimeType($uploadResult->mimeType)
            ->setExtension($uploadResult->extension)
            ->setSize($uploadResult->size)
            ->setType($this->matchMimeType($uploadResult->mimeType))
            ->setCreatedAt($this->now())
            ->setOwner($user);

        $this->em->persist($attachment);
        $this->em->flush();

        $this->generateLog(
            LoggerLevelEnum::Info,
            [
                'message'   => 'Fichier uploadé avec succès',
                'target'    => (new \ReflectionClass($target))->getShortName(),
                'target_id' => (string) $target->getId(),
                'file'      => $uploadResult->originalName,
                'size'      => $this->formatFileSize($uploadResult->size),
            ],
            ['action' => 'attachment.upload.success']
        );

        return $attachment;
    }

    /**
     * Supprime le fichier sur disque et son enregistrement BDD.
     */
    public function delete(AbstractFile $file): bool
    {
        try {
            if ($file->getFilePath()) {
                $this->uploader->delete((string) $this->extractRelativePath($file->getFilePath()));
            }

            $this->em->remove($file);
            $this->em->flush();

            $this->generateLog(
                LoggerLevelEnum::Info,
                ['message' => 'Fichier supprimé', 'file_id' => (string) $file->getId()],
                ['action' => 'attachment.delete.success']
            );

            return true;
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Error,
                ['message' => 'Erreur lors de la suppression du fichier', 'file_id' => (string) $file->getId(), 'error' => $e->getMessage()],
                ['action' => 'attachment.delete.error']
            );

            return false;
        }
    }

    /**
     * Supprime tous les fichiers liés à une entité donnée.
     */
    public function deleteByTarget(Todo|Note|Entry $target): void
    {
        $files = match (true) {
            $target instanceof Entry => $target->getEntryMedia(),
            $target instanceof Note || $target instanceof Todo => $target->getFiles(),
        };

        foreach ($files as $file) {
            $this->delete($file);
        }
    }

    public function formatFileUri(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;

        $base = !empty($this->defaultUri) ? rtrim($this->defaultUri, '/') : rtrim($this->getOrigin(), '/');
        return sprintf('%s/%s', $base, ltrim($path, '/'));
    }

    private function extractRelativePath(?string $urlOrPath): ?string
    {
        if (!$urlOrPath) return null;
        $parsed = parse_url($urlOrPath, PHP_URL_PATH);
        return ltrim($parsed ?: $urlOrPath, '/');
    }
}
