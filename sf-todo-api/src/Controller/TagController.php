<?php

namespace App\Controller;

use App\Entity\TodoTag;
use App\Security\Voter\OwnerVoter;
use App\Service\TodoTagService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/tags', name: 'api_tags_')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class TagController extends AbstractController
{
    public function __construct(
        private readonly TodoTagService $service,
    ) {}

    /**
     * GET /api/tags
     * Récupère tous les TodoTag de l'utilisateur connecté.
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $response = $this->service->listTags();

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * POST /api/tags
     * Crée un nouveau TodoTag rattaché à l'utilisateur connecté.
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $response = $this->service->createTag($request);

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * GET /api/tags/{id}
     * Récupère le détail d'un TodoTag appartenant à l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $tag = $this->service->findOneTag($id);
        $response = $this->service->sendJson(data: ['message' => sprintf('Unabled to find a tag for `%s`', $id)], status: Response::HTTP_NOT_FOUND);

        if ($tag instanceof TodoTag) {
            $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $tag);

            $response = $this->service->sendJson($tag, context: ['groups' => 'tag.read']);
        }

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * PUT /api/tags/{id}
     * Met à jour un TodoTag de l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $tag = $this->service->findOneTag($id);
        $response = $this->service->sendJson(data: ['message' => sprintf('Unabled to find a tag for `%s`', $id)], status: Response::HTTP_NOT_FOUND);

        if ($tag instanceof TodoTag) {
            $this->denyAccessUnlessGranted(OwnerVoter::EDIT, $tag);

            $response = $this->service->updateTag($tag, $request);
        }

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * DELETE /api/tags/{id}
     * Supprime un TodoTag de l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $tag = $this->service->findOneTag($id);
        $response = $this->service->sendJson(data: ['message' => sprintf('Unabled to find a tag for `%s`', $id)], status: Response::HTTP_NOT_FOUND);

        if ($tag instanceof TodoTag) {
            $this->denyAccessUnlessGranted(OwnerVoter::DELETE, $tag);

            $response = $this->service->deleteTag($tag);
        }

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context
        );
    }

    /**
     * GET /api/tags/{id}/todos
     * Récupère les Todo liés au tag et à l'utilisateur connecté.
     */
    #[Route('/{id}/todos', name: 'todos', methods: ['GET'])]
    public function listTodos(TodoTag $tag): JsonResponse
    {
        $this->denyAccessUnlessGranted(OwnerVoter::VIEW, $tag);

        // TODO: Retourner $tag->getTodos() ou filtrer via TodoRepository
        return $this->json($tag->getTodos(), Response::HTTP_OK, [], ['groups' => ['task.list']]);
    }
}
