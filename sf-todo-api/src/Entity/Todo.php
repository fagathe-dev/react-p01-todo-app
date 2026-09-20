<?php

namespace App\Entity;

use App\Enum\Todo\DueDateEnum;
use App\Repository\TodoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid; // Namespace officiel Symfony Component

#[ORM\Entity(repositoryClass: TodoRepository::class)]
class Todo
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[Groups(['todo.read', 'todo.list'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 200)]
    #[Groups(['todo.read', 'todo.list'])]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups(['todo.read', 'todo.list'])]
    private bool $isDone = false;

    #[ORM\Column(length: 20, nullable: true, enumType: DueDateEnum::class)]
    #[Groups(['todo.read', 'todo.list'])]
    private ?DueDateEnum $dueDate = null;

    #[ORM\Column]
    #[Groups(['todo.read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    #[Groups(['todo.read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['todo.read'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'todos')]
    private ?User $owner = null;

    #[ORM\ManyToOne(inversedBy: 'todos')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['todo.list', 'todo.read'])]
    private ?TodoTag $tag = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function isDone(): bool
    {
        return $this->isDone;
    }

    public function setIsDone(bool $isDone): static
    {
        $this->isDone = $isDone;
        return $this;
    }

    public function getDueDate(): ?DueDateEnum
    {
        return $this->dueDate;
    }

    public function setDueDate(DueDateEnum|string|null $dueDate): static
    {
        if (is_string($dueDate)) {
            $dueDate = DueDateEnum::tryFrom($dueDate);
        }

        $this->dueDate = $dueDate;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }

    public function getTag(): ?TodoTag
    {
        return $this->tag;
    }

    public function setTag(?TodoTag $tag): static
    {
        $this->tag = $tag;
        return $this;
    }
}
