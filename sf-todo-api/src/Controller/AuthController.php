<?php

namespace App\Controller;

use App\Service\AuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth', name: 'api_auth_')]
final class AuthController extends AbstractController
{

    public function __construct(private readonly AuthService $service) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $response = $this->service->register($request);

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context,
        );
    }

    #[Route('/delete-account', name: 'delete-account', methods: ['DELETE'])]
    public function deleteAccount(): JsonResponse
    {
        $response = $this->service->deleteAccount();

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context,
        );
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $response = $this->service->getProfile();

        return $this->json(
            $response->data,
            $response->status,
            $response->headers,
            $response->context,
        );
    }
}
