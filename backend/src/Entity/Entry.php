<?php

namespace App\Entity;

use App\Enum\ColorEnum;
use App\Enum\MoodEnum;
use App\Repository\EntryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: EntryRepository::class)]
#[Assert\Callback([Entry::class, 'validateContentOrTitle'])]
class Entry extends AbstractTextEntry
{
    #[ORM\Column(length: 200, nullable: true)]
    #[Assert\Length(max: 200)]
    #[Groups(['entry.list', 'entry.read'])]
    private ?string $title = null;

    #[ORM\Column(length: 30, nullable: true, enumType: ColorEnum::class)]
    #[Groups(['entry.list', 'entry.read'])]
    private ColorEnum|string|null $color = null;

    #[ORM\Column(length: 50, nullable: true, enumType: MoodEnum::class)]
    #[Groups(['entry.list', 'entry.read'])]
    private MoodEnum|string|null $mood = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Regex(pattern: '/^[a-z0-9]+(?:-[a-z0-9]+)*$/', message: 'Le slug ne peut contenir que des minuscules, chiffres et tirets.')]
    #[Groups(['entry.list', 'entry.read'])]
    private ?string $slug = null;

    #[ORM\ManyToOne(targetEntity: Tag::class, inversedBy: 'entries')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['entry.list', 'entry.read'])]
    private ?Tag $tag = null;

    /**
     * @var Collection<int, EntryMedia>
     */
    #[ORM\OneToMany(targetEntity: EntryMedia::class, mappedBy: 'entry', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['entry.read', 'entry.list'])]
    private Collection $entryMedia;

    #[ORM\ManyToOne(inversedBy: 'entries')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $owner = null;

    #[ORM\ManyToOne(targetEntity: Location::class, cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['entry.list', 'entry.read'])]
    private ?Location $location = null;

    public function __construct()
    {
        parent::__construct();
        $this->entryMedia = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getColor(): ?ColorEnum
    {
        return $this->color instanceof ColorEnum ? $this->color : ColorEnum::tryFrom((string) $this->color);
    }

    public function setColor(ColorEnum|string|null $color): static
    {
        if (is_string($color)) {
            $color = ColorEnum::tryFrom($color);
        }
        $this->color = $color;
        return $this;
    }

    public function getMood(): ?MoodEnum
    {
        return $this->mood instanceof MoodEnum ? $this->mood : MoodEnum::tryFrom((string) $this->mood);
    }

    public function setMood(MoodEnum|string|null $mood): static
    {
        if (is_string($mood)) {
            $mood = MoodEnum::tryFrom($mood);
        }
        $this->mood = $mood;
        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;
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
     * @return Collection<int, EntryMedia>
     */
    public function getEntryMedia(): Collection
    {
        return $this->entryMedia;
    }

    public function addEntryMedium(EntryMedia $entryMedium): static
    {
        if (!$this->entryMedia->contains($entryMedium)) {
            $this->entryMedia->add($entryMedium);
            $entryMedium->setEntry($this);
        }
        return $this;
    }

    public function removeEntryMedium(EntryMedia $entryMedium): static
    {
        if ($this->entryMedia->removeElement($entryMedium)) {
            if ($entryMedium->getEntry() === $this) {
                $entryMedium->setEntry(null);
            }
        }
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

    public static function validateContentOrTitle(self $entry, ExecutionContextInterface $context): void
    {
        if (empty(trim((string) $entry->getTitle())) && empty(trim((string) $entry->getContent()))) {
            $context->buildViolation('Le titre ou le contenu est obligatoire.')
                ->atPath('content')
                ->addViolation();
        }
    }

    public function getLocation(): ?Location
    {
        return $this->location;
    }

    public function setLocation(?Location $location): static
    {
        $this->location = $location;

        return $this;
    }
}
