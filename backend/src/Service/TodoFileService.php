<?php

namespace App\Service;

use App\Entity\Todo;
use App\Entity\TodoFile;
use App\Entity\User;
use App\Repository\TodoFileRepository;
use Fagathe\CorePhp\Enum\LoggerLevelEnum;
use Fagathe\CorePhp\File\FileTrait;
use Fagathe\CorePhp\File\MimeType;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Fagathe\CorePhp\Trait\LoggerTrait;
use Fagathe\CorePhp\Uploader\FileUploadException;
use Fagathe\CorePhp\Uploader\UploaderService;
use Fagathe\CorePhp\Uploader\UploaderValidationService;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Throwable;

final class TodoFileService
{
    use LoggerTrait, DatetimeTrait, FileTrait;

    private const MAX_SIZE = 20 * 1024 * 1024; // 20 Mo

    public function __construct(
        private readonly TodoFileRepository $repository,
        private readonly UploaderService $uploader,
    ) {}

    /**
     * Valide et uploade un fichier joint à une tâche Todo.
     *
     * @throws FileUploadException si le fichier est invalide ou en cas d'échec du transfert
     */
    public function upload(UploadedFile $file, Todo $todo, User $user): TodoFile
    {
        // 1. Validation avec la liste globale des types MIME supportés
        $validator = new UploaderValidationService();
        $validator
            ->setAllowedMimeTypes(MimeType::getSupportedMimetypes())
            ->setMaxSize(self::MAX_SIZE);

        $result = $validator->validate($file);
        if ($result !== true && is_array($result)) {
            throw new FileUploadException(implode(' ', $result));
        }

        // 2. Déplacement physique vers public/uploads/todos/{userId}/
        $uploadResult = $this->uploader
            ->setUploadDirectory('todos/' . (string) $user->getId())
            ->upload($file);

        // 3. Détection du type lisible via FileTrait (qui appelle FileTypeEnum::matchMime)
        $type = $this->matchMimeType($uploadResult->mimeType);

        // 4. Instanciation et persistance de l'entité TodoFile
        $todoFile = (new TodoFile())
            ->setOriginalName($uploadResult->originalName)
            ->setFilePath($uploadResult->relativePath)
            ->setMimeType($uploadResult->mimeType)
            ->setExtension($uploadResult->extension)
            ->setSize($uploadResult->size)
            ->setType($type)
            ->setCreatedAt($this->now())
            ->setOwner($user)
            ->setTodo($todo);

        $this->repository->save($todoFile, flush: true, isCreation: true);

        // 5. Journalisation avec formatage lisible de la taille (via FileTrait / FileSizeFormatter)
        $this->generateLog(
            LoggerLevelEnum::Info,
            [
                'message' => 'Fichier attaché au Todo',
                'todo_id' => (string) $todo->getId(),
                'file'    => $uploadResult->originalName,
                'path'    => $uploadResult->relativePath,
                'size'    => $this->formatFileSize($uploadResult->size),
                'type'    => $type,
            ],
            ['action' => 'app.todo_file.upload.success']
        );

        return $todoFile;
    }

    /**
     * Supprime le fichier physique et son enregistrement en base.
     */
    public function delete(TodoFile $todoFile): bool
    {
        try {
            if ($todoFile->getFilePath()) {
                $this->uploader->delete($todoFile->getFilePath());
            }

            $this->repository->remove($todoFile, flush: true);

            $this->generateLog(
                LoggerLevelEnum::Info,
                [
                    'message' => 'Fichier todo supprimé',
                    'file_id' => (string) $todoFile->getId(),
                ],
                ['action' => 'app.todo_file.delete.success']
            );

            return true;
        } catch (Throwable $e) {
            $this->generateLog(
                LoggerLevelEnum::Error,
                [
                    'message' => 'Erreur lors de la suppression du fichier todo',
                    'file_id' => (string) $todoFile->getId(),
                    'error'   => $e->getMessage(),
                ],
                ['action' => 'app.todo_file.delete.error']
            );

            return false;
        }
    }

    /**
     * Supprime l'ensemble des fichiers rattachés à un Todo.
     */
    public function deleteByTodo(Todo $todo): void
    {
        foreach ($todo->getFiles() as $file) {
            $this->delete($file);
        }
    }
}