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
        $res = $this->service->register($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/verify-otp', name: 'verify_otp', methods: ['POST'])]
    public function verifyOtp(Request $request): JsonResponse
    {
        $res = $this->service->verifyOtp($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/forgot-password', name: 'forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $res = $this->service->forgotPassword($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }

    #[Route('/reset-password', name: 'reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $res = $this->service->resetPassword($request);
        return $this->json($res->data, $res->status, $res->headers, $res->context);
    }
}
