<?php

namespace App\Controller;

use App\Entity\Todo;
use App\Security\Voter\OwnerVoter;
use App\Service\TodoService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/todos', name: 'api_todos_')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class TodoController extends AbstractController
{
    public function __construct(
        private readonly TodoService $service,
    ) {}

    /**
     * GET /api/todos
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $response =$this->service->listTodos();

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }

    /**
     * POST /api/todos
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $response = $this->service->createTodo($request);

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }

    /**
     * GET /api/todos/{id}
     */
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);

        if (!$todo instanceof Todo) {
            return $this->json(['message' => sprintf('Aucune tâche trouvée pour `%s`', $id)], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::VIEW,$todo);

        $response = $this->service->sendJson($todo, context: ['groups' => ['todo.read', 'file.read']]);

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }

    /**
     * POST /api/todos/{id} (ou PUT)
     * Reçoit le FormData pour la mise à jour et l'envoi de fichiers.
     */
    #[Route('/{id}', name: 'update', methods: ['POST', 'PUT'])]
    public function update(Todo $todo, Request$request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT,$todo);

        $response =$this->service->updateTodo($todo,$request);

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }

    /**
     * DELETE /api/todos/{id}
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);

        if (!$todo instanceof Todo) {
            return $this->json(['message' => sprintf('Aucune tâche trouvée pour `%s`', $id)], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::DELETE,$todo);

        $response = $this->service->deleteTodo($todo);

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }

    /**
     * DELETE /api/todos/{id}/files/{fileId}
     * Supprime un fichier individuel rattaché à la tâche.
     */
    #[Route('/{id}/files/{fileId}', name: 'delete_file', methods: ['DELETE'])]
    public function deleteFile(Todo $todo, string$fileId): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT,$todo);

        $response =$this->service->deleteTodoFile($todo,$fileId);

        return $this->json(
            $response->data,$response->status,
            $response->headers,$response->context
        );
    }
}