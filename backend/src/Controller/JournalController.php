<?php

namespace App\Controller;

use App\Entity\Entry;
use App\Entity\User;
use App\Service\JournalService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/journal', name: 'api_journal_')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class JournalController extends AbstractController
{
    public function __construct(
        private readonly JournalService $service,
        private readonly EntityManagerInterface $em,
    ) {}

    /**
     * Vérification du mot de passe journal et délivrance du badge jCodeToken.
     */
    #[Route('/unlock', name: 'unlock', methods: ['POST'])]
    public function unlock(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->hasJournalPasscode()) {
            return $this->json(['message' => 'Aucun code secret configuré pour ce compte.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $passcode = trim((string) ($data['passcode'] ?? ''));

        if (empty($passcode)) {
            return $this->json(['message' => 'Le code secret est obligatoire.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!password_verify($passcode, (string) $user->getJournalPasscode())) {
            return $this->json(['message' => 'Code secret incorrect.'], Response::HTTP_FORBIDDEN);
        }

        // Si l'utilisateur n'a pas encore de token badge généré en base
        if (!$user->getJCodeToken()) {
            $user->setJCodeToken(bin2hex(random_bytes(40)));
            $this->em->flush();
        }

        return $this->json([
            'jCodeToken' => $user->getJCodeToken(),
            'message'    => 'Journal déverrouillé avec succès.',
        ]);
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        if ($authError = $this->verifyJournalAuth($request)) {
            return $authError;
        }

        $res = $this->service->listEntries($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        if ($authError = $this->verifyJournalAuth($request)) {
            return $authError;
        }

        $res = $this->service->createEntry($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Entry $entry, Request $request): JsonResponse
    {
        if ($authError = $this->verifyJournalAuth($request)) {
            return $authError;
        }

        $res = $this->service->showEntry($entry);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'update', methods: ['POST', 'PUT', 'PATCH'])]
    public function update(Entry $entry, Request $request): JsonResponse
    {
        if ($authError = $this->verifyJournalAuth($request)) {
            return $authError;
        }

        $res = $this->service->updateEntry($entry, $request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Entry $entry, Request $request): JsonResponse
    {
        if ($authError = $this->verifyJournalAuth($request)) {
            return $authError;
        }

        $res = $this->service->deleteEntry($entry);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * Contrôle la validité de l'en-tête X-JOURNAL-AUTH.
     */
    private function verifyJournalAuth(Request $request): ?JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $headerToken = $request->headers->get('X-JOURNAL-AUTH');
        $expectedToken = $user->getJCodeToken();

        if (empty($headerToken) || empty($expectedToken) || !hash_equals($expectedToken, $headerToken)) {
            return $this->json([
                'message' => 'Accès refusé : journal verrouillé ou jeton invalide.',
            ], Response::HTTP_FORBIDDEN);
        }

        return null;
    }
}
