<?php

namespace App\Controller\Auth;

use App\Service\AccountService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/account', name: 'api_account_')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class AccountController extends AbstractController
{
    public function __construct(private readonly AccountService $service) {}

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $res = $this->service->getProfile();
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * PUT /api/account/profile : Mettre à jour les informations du compte
     */
    #[Route('/profile', name: 'update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $res = $this->service->updateProfile($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * POST /api/account/avatar : Mettre à jour l'avatar
     */
    #[Route('/avatar', name: 'update_avatar', methods: ['POST'])]
    public function updateAvatar(Request $request): JsonResponse
    {
        $res = $this->service->updateAvatar($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * PUT /api/account/journal-passcode : Ajouter ou modifier le code secret du journal
     */
    #[Route('/journal-passcode', name: 'set_journal_passcode', methods: ['PUT'])]
    public function setJournalPasscode(Request $request): JsonResponse
    {
        $res = $this->service->setJournalPasscode($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * POST /api/account/journal-passcode/verify : Vérifier le code secret saisi
     */
    #[Route('/journal-passcode/verify', name: 'verify_journal_passcode', methods: ['POST'])]
    public function verifyJournalPasscode(Request $request): JsonResponse
    {
        $res = $this->service->verifyJournalPasscode($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    /**
     * GET /api/account/journal-passcode/status : Savoir si un code est déjà configuré
     */
    #[Route('/journal-passcode/status', name: 'journal_passcode_status', methods: ['GET'])]
    public function getJournalPasscodeStatus(): JsonResponse
    {
        $res = $this->service->getJournalPasscodeStatus();
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/password', name: 'change_password', methods: ['PUT', 'PATCH'])]
    public function changePassword(Request $request): JsonResponse
    {
        $res = $this->service->changePassword($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('', name: 'delete', methods: ['DELETE'])]
    public function deleteAccount(): JsonResponse
    {
        $res = $this->service->deleteAccount();
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }
}
