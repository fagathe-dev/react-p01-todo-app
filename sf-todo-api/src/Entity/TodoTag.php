<?php

namespace App\Entity;

use App\Enum\Todo\TagColorEnum;
use App\Repository\TodoTagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TodoTagRepository::class)]
#[ORM\UniqueConstraint(name: 'uniq_user_tag_color', fields: ['owner', 'color'])]
#[UniqueEntity(fields: ['color', 'owner'], message: 'Vous avez déjà un tag avec cette couleur: {{ value}}.')]
class TodoTag
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire !')]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list'])]
    private ?string $name = null;

    #[ORM\Column(length: 20, nullable: true, enumType: TagColorEnum::class)]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list'])]
    private TagColorEnum|string|null $color = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['tag.read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['tag.read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['tag.read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'tags')]
    private ?User $owner = null;

    /**
     * @var Collection<int, Todo>
     */
    #[ORM\OneToMany(targetEntity: Todo::class, mappedBy: 'tag')]
    private Collection $todos;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->todos = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getColor(): ?TagColorEnum
    {
        return $this->color;
    }

    public function setColor(TagColorEnum|string|null $color): static
    {
        if (is_string($color)) {
            $color = TagColorEnum::tryFrom($color);
        }

        $this->color = $color;

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

    public function getCreatedAt(): ?\DateTimeImmutable
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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    /**
     * @return Collection<int, Todo>
     */
    public function getTodos(): Collection
    {
        return $this->todos;
    }

    public function addTodo(Todo $todo): static
    {
        if (!$this->todos->contains($todo)) {
            $this->todos->add($todo);
            $todo->setTag($this);
        }

        return $this;
    }

    public function removeTodo(Todo $todo): static
    {
        if ($this->todos->removeElement($todo)) {
            // set the owning side to null (unless already changed)
            if ($todo->getTag() === $this) {
                $todo->setTag(null);
            }
        }

        return $this;
    }
}
