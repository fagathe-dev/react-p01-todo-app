<?php

namespace App\Entity;

use App\Repository\TodoRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\Column(nullable: true)]
    #[Groups(['todo.read', 'todo.list'])]
    private ?DateTimeImmutable $dueDate = null;

    #[ORM\Column]
    #[Groups(['todo.read'])]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    #[Groups(['todo.read'])]
    private ?DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['todo.read'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'todos')]
    private ?User $owner = null;

    #[ORM\ManyToOne(inversedBy: 'todos')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['todo.list', 'todo.read'])]
    private ?Tag $tag = null;
    /**
     * @var Collection<int, TodoFile>
     */
    #[ORM\OneToMany(targetEntity: TodoFile::class, mappedBy: 'todo', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['todo.read', 'todo.list'])]
    private Collection $files;

    /**
     * @var Collection<int, TodoComment>
     */
    #[ORM\OneToMany(targetEntity: TodoComment::class, mappedBy: 'todo')]
    #[Groups(['todo.read', 'todo.list'])]
    private Collection $comments;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->createdAt = new DateTimeImmutable();
        $this->files = new ArrayCollection();
        $this->comments = new ArrayCollection();
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

    public function getDueDate(): ?DatetimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(?DatetimeImmutable $dueDate): static
    {

        $this->dueDate = $dueDate;
        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?DateTimeImmutable $updatedAt): static
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

    public function getTag(): ?Tag
    {
        return $this->tag;
    }

    public function setTag(?Tag $tag): static
    {
        $this->tag = $tag;
        return $this;
    }

    /**
     * @return Collection<int, TodoFile>
     */
    public function getFiles(): Collection
    {
        return $this->files;
    }

    public function addFile(TodoFile $file): static
    {
        if (!$this->files->contains($file)) {
            $this->files->add($file);
            $file->setTodo($this);
        }
        return $this;
    }

    public function removeFile(TodoFile $file): static
    {
        if ($this->files->removeElement($file)) {
            if ($file->getTodo() === $this) {
                $file->setTodo(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, TodoComment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(TodoComment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setTodo($this);
        }

        return $this;
    }

    public function removeComment(TodoComment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getTodo() === $this) {
                $comment->setTodo(null);
            }
        }

        return $this;
    }
}
