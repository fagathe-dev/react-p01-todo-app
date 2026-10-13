<?php

namespace App\Controller;

use App\Entity\Note;
use App\Security\Voter\OwnerVoter;
use App\Service\NoteService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/notes', name: 'api_notes_')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class NoteController extends AbstractController
{
    public function __construct(private readonly NoteService $service) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $res = $this->service->listNotes($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $res = $this->service->createNote($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $note = $this->service->findOneNote($id);
        if (!$note instanceof Note) {
            return $this->json(['message' => 'Note introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $note);
        $res = $this->service->sendJson($note, context: ['groups' => ['note.read', 'tag.read', 'file.read']]);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'update', methods: ['POST', 'PUT'])]
    public function update(Note $note, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $note);
        $res = $this->service->updateNote($note, $request);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}/restore', name: 'restore', methods: ['POST', 'PATCH'])]
    public function restore(string $id): JsonResponse
    {
        $note = $this->service->findOneNote($id);
        if (!$note instanceof Note) {
            return $this->json(['message' => 'Note introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $note);
        $res = $this->service->restoreNote($note);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id, Request $request): JsonResponse
    {
        $note = $this->service->findOneNote($id);
        if (!$note instanceof Note) {
            return $this->json(['message' => 'Note introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::DELETE, $note);
        $permanent = filter_var($request->query->get('permanent', false), FILTER_VALIDATE_BOOLEAN);
        $res = $this->service->deleteNote($note, $permanent);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}/files/{fileId}', name: 'delete_file', methods: ['DELETE'])]
    public function deleteFile(Note $note, string $fileId): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $note);
        $res = $this->service->deleteNoteFile($note, $fileId);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/trash/empty', name: 'empty_trash', methods: ['DELETE'])]
    public function emptyTrash(): JsonResponse
    {
        $res = $this->service->emptyTrash();
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }
}
