<?php

namespace App\Controller;

use DateTimeInterface;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HealthCheckController extends AbstractController
{
    use DatetimeTrait;

    #[Route('/health-check', name: 'health_check', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        return $this->json([
            'status'    => 'ok',
            'timestamp' => $this->now()->format(DateTimeInterface::ATOM),
            'service'   => 'todo-api',
            'version'   => '1.0.0',
        ], Response::HTTP_OK);
    }
}
