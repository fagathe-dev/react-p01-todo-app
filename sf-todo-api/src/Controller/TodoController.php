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
     * Récupère tous les TodoTag de l'utilisateur connecté.
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $response = $this->service->listTodos();

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * POST /api/todos
     * Crée un nouveau TodoTag rattaché à l'utilisateur connecté.
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $response = $this->service->createTodo($request);

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * GET /api/todos/{id}
     * Récupère le détail d'un Todo appartenant à l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);
        $response = $this->service->sendJson(data: ['message' => sprintf('Unabled to find a todo for `%s`', $id)], status: Response::HTTP_NOT_FOUND);

        if ($todo instanceof Todo) {
            $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $todo);

            $response = $this->service->sendJson($todo, context: ['groups' => ['todo.read']]);
        }

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * PUT /api/todos/{id}
     * Met à jour un Todo de l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(Todo $todo, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $todo);

        $response = $this->service->updateTodo($todo, $request);

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * DELETE /api/todos/{id}
     * Supprime un Todo de l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);
        $response = $this->service->sendJson(data: ['message' => sprintf('Unabled to find a todo for `%s`', $id)], status: Response::HTTP_NOT_FOUND);

        if ($todo instanceof Todo) {
            $this->denyAccessUnlessGranted(OwnerVoter::DELETE, $todo);

            $response = $this->service->deleteTodo($todo);
        }

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }
}
