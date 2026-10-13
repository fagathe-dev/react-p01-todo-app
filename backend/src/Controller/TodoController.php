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
    public function __construct(private readonly TodoService $service) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $res = $this->service->listTodos();
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $res = $this->service->createTodo($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);
        if (!$todo instanceof Todo) {
            return $this->json(['message' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $todo);
        $res = $this->service->sendJson($todo, context: ['groups' => ['todo.read', 'file.read', 'user.read']]);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'update', methods: ['POST', 'PUT'])]
    public function update(Todo $todo, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $todo);
        $res = $this->service->updateTodo($todo, $request);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $todo = $this->service->findOneTodo($id);
        if (!$todo instanceof Todo) {
            return $this->json(['message' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(OwnerVoter::DELETE, $todo);
        $res = $this->service->deleteTodo($todo);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}/files/{fileId}', name: 'delete_file', methods: ['DELETE'])]
    public function deleteFile(Todo $todo, string $fileId): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $todo);
        $res = $this->service->deleteTodoFile($todo, $fileId);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}/comments', name: 'add_comment', methods: ['POST'])]
    public function addComment(Todo $todo, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $todo);
        $res = $this->service->addComment($todo, $request);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}/comments/{commentId}', name: 'delete_comment', methods: ['DELETE'])]
    public function deleteComment(Todo $todo, string $commentId): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $todo);
        $res = $this->service->deleteComment($todo, $commentId);

        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }
}