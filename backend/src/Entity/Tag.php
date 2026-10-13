<?php

namespace App\Entity;

use App\Enum\ColorEnum;
use App\Repository\TagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TagRepository::class)]
#[ORM\UniqueConstraint(name: 'uniq_user_tag_color', fields: ['owner', 'color'])]
#[UniqueEntity(fields: ['color', 'owner'], message: 'Vous avez déjà un tag avec cette couleur: {{ value}}.')]
class Tag
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list', 'note.list', 'note.read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire !')]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list', 'note.list', 'note.read'])]
    private ?string $name = null;

    #[ORM\Column(length: 20, nullable: true, enumType: ColorEnum::class)]
    #[Groups(['tag.list', 'tag.read', 'todo.read', 'todo.list'])]
    private ColorEnum|string|null $color = null;

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

    /**
     * @var Collection<int, Note>
     */
    #[ORM\OneToMany(targetEntity: Note::class, mappedBy: 'tag')]
    private Collection $notes;

    /**
     * @var Collection<int, Entry>
     */
    #[ORM\OneToMany(targetEntity: Entry::class, mappedBy: 'tag')]
    private Collection $entries;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->todos = new ArrayCollection();
        $this->notes = new ArrayCollection();
        $this->entries = new ArrayCollection();
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

    public function getColor(): ?ColorEnum
    {
        return $this->color;
    }

    public function setColor(ColorEnum|string|null $color): static
    {
        if (is_string($color)) {
            $color = ColorEnum::tryFrom($color);
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

    public function getNotes(): Collection
    {
        return $this->notes;
    }

    public function addNote(Note $note): static
    {
        if (!$this->notes->contains($note)) {
            $this->notes->add($note);
            $note->setTag($this);
        }
        return $this;
    }

    public function removeNote(Note $note): static
    {
        if ($this->notes->removeElement($note)) {
            if ($note->getTag() === $this) {
                $note->setTag(null);
            }
        }
        return $this;
    }

    public function getEntries(): Collection
    {
        return $this->entries;
    }

    public function addEntry(Entry $entry): static
    {
        if (!$this->entries->contains($entry)) {
            $this->entries->add($entry);
            $entry->setTag($this);
        }
        return $this;
    }

    public function removeEntry(Entry $entry): static
    {
        if ($this->entries->removeElement($entry)) {
            if ($entry->getTag() === $this) {
                $entry->setTag(null);
            }
        }
        return $this;
    }
}
