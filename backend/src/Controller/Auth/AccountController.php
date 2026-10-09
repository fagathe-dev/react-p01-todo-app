<?php

namespace App\Controller;

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

    #[Route('/profile', name: 'update_profile', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $res = $this->service->updateProfile($request);
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
