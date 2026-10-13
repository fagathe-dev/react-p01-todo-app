<?php

namespace App\Entity;

use App\Enum\StateEnum;
use App\Enum\ColorEnum;
use App\Repository\NoteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: NoteRepository::class)]
#[ORM\Index(name: 'idx_ft_note', columns: ['title', 'content'], flags: ['fulltext'])]
class Note extends AbstractTextEntry
{
    #[ORM\Column(length: 160, nullable: true)]
    #[Groups(['note.list', 'note.read'])]
    private ?string $title = null;

    #[ORM\Column(length: 30, enumType: StateEnum::class)]
    #[Groups(['note.list', 'note.read'])]
    private StateEnum|string|null $state = StateEnum::Open;

    #[ORM\ManyToOne(inversedBy: 'notes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['note.list'])]
    private ?User $owner = null;

    /**
     * @var Tag|null
     */
    #[ORM\ManyToOne(targetEntity: Tag::class, inversedBy: 'notes', cascade: ['persist'])]
    private ?Tag $tag = null;

    #[ORM\Column(length: 30, nullable: true, enumType: ColorEnum::class)]
    #[Groups(['note.list', 'note.read'])]
    private ColorEnum|string|null $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['note.list', 'note.read'])]
    private ?\DateTimeImmutable $deleted_at = null;

    /**
     * @var Collection<int, NoteFile>
     */
    #[ORM\OneToMany(targetEntity: NoteFile::class, mappedBy: 'note', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['note.list', 'note.read'])]
    private Collection $files;

    public function __construct()
    {
        parent::__construct();
        $this->files = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getState(): StateEnum
    {
        return $this->state;
    }

    public function setState(StateEnum|string $state): static
    {
        if (is_string($state)) {
            $state = StateEnum::tryFrom($state);
        }

        $this->state = $state;

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
     * @return Tag|null
     */
    public function getTag(): ?Tag
    {
        return $this->tag;
    }

    /**
     * @param Tag|null $tag
     * 
     * @return static
     */
    public function setTag(?Tag $tag = null): static
    {
        $this->tag = $tag;

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

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deleted_at;
    }

    public function setDeletedAt(?\DateTimeImmutable $deleted_at): static
    {
        $this->deleted_at = $deleted_at;

        return $this;
    }

    /**
     * @return Collection<int, NoteFile>
     */
    public function getFiles(): Collection
    {
        return $this->files;
    }

    public function addFile(NoteFile $file): static
    {
        if (!$this->files->contains($file)) {
            $this->files->add($file);
            $file->setNote($this);
        }
        return $this;
    }

    public function removeFile(NoteFile $file): static
    {
        if ($this->files->removeElement($file)) {
            if ($file->getNote() === $this) {
                $file->setNote(null);
            }
        }
        return $this;
    }
}
