<?php

namespace App\Entity;

use App\Enum\Auth\RoleEnum;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
#[UniqueEntity(fields: ['email'], message: 'Cette adresse email est déjà utilisée.')]
#[UniqueEntity(fields: ['username'], message: 'Ce nom d\'utilisateur est déjà pris.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[Groups(['user.read', 'note.list'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\Email(message: 'Cet adresse e-mail est invalide !')]
    #[Assert\NotBlank(message: 'L\'adresse e-mail est obligatoire')]
    #[Groups(['user.read'])]
    private ?string $email = null;

    /**
     * @var array<RoleEnum> The user roles
     */
    #[ORM\Column]
    #[Groups(['user.read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Assert\Regex(
        '#^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){8,}#',
        'Le mot de passe doit contenir au moins une masjuscule, une minuscule et un chiffre avec au moins 8 caractères !',
        null,
        true
    )]
    #[Assert\NotBlank(message: 'Ce champ est obligatoire !')]
    private ?string $password = null;

    #[ORM\Column(length: 90)]
    #[Assert\NotBlank(message: 'Le nom d\'utilisateur est obligatoire')]
    #[Assert\Length(min: 3, max: 90, minMessage: 'Le nom d\'utilisateur doit contenir au moins 3 caractères', maxMessage: 'Le nom d\'utilisateur doit contenir maximum 90 caractères')]
    #[Groups(['user.read'])]
    private ?string $username = null;

    #[ORM\Column]
    #[Groups(['user.read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user.read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, Tag>
     */
    #[ORM\OneToMany(targetEntity: Tag::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $tags;

    /**
     * @var Collection<int, Todo>
     */
    #[ORM\OneToMany(targetEntity: Todo::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $todos;

    /**
     * @var Collection<int, Note>
     */
    #[ORM\OneToMany(targetEntity: Note::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $notes;

    /**
     * @var Collection<int, Entry>
     */
    #[ORM\OneToMany(targetEntity: Entry::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $entries;

    /**
     * @var Collection<int, TodoFile>
     */
    #[ORM\OneToMany(targetEntity: TodoFile::class, mappedBy: 'owner', cascade: ['persist'])]
    private Collection $todoFiles;

    /**
     * @var Collection<int, NoteFile>
     */
    #[ORM\OneToMany(targetEntity: NoteFile::class, mappedBy: 'owner', cascade: ['persist'])]
    private Collection $noteFiles;

    /**
     * @var Collection<int, EntryMedia>
     */
    #[ORM\OneToMany(targetEntity: EntryMedia::class, mappedBy: 'owner', cascade: ['persist'])]
    private Collection $entryMedia;

    /**
     * @var Collection<int, Location>
     */
    #[ORM\OneToMany(targetEntity: Location::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $locations;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $emailVerifiedAt = null;

    #[ORM\Column(length: 80, nullable: true)]
    #[Groups(['user.read'])]
    private ?string $firstname = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isVerified = null;

    #[ORM\Column(length: 80, nullable: true)]
    #[Groups(['user.read'])]
    private ?string $lastname = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user.read'])]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $journalPasscode = null;

    #[ORM\Column(length: 90, nullable: true)]
    private ?string $jCodeToken = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->tags = new ArrayCollection();
        $this->todos = new ArrayCollection();
        $this->notes = new ArrayCollection();
        $this->entries = new ArrayCollection();
        $this->todoFiles = new ArrayCollection();
        $this->noteFiles = new ArrayCollection();
        $this->entryMedia = new ArrayCollection();
        $this->locations = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, to be removed when upgrading to Symfony 8
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

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

    /**
     * @return Collection<int, Tag>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(Tag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
            $tag->setOwner($this);
        }

        return $this;
    }

    public function removeTag(Tag $tag): static
    {
        if ($this->tags->removeElement($tag)) {
            // set the owning side to null (unless already changed)
            if ($tag->getOwner() === $this) {
                $tag->setOwner(null);
            }
        }

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
            $todo->setOwner($this);
        }

        return $this;
    }

    public function removeTodo(Todo $todo): static
    {
        if ($this->todos->removeElement($todo)) {
            // set the owning side to null (unless already changed)
            if ($todo->getOwner() === $this) {
                $todo->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Note>
     */
    public function getNotes(): Collection
    {
        return $this->notes;
    }

    public function addNote(Note $note): static
    {
        if (!$this->notes->contains($note)) {
            $this->notes->add($note);
            $note->setOwner($this);
        }

        return $this;
    }

    public function removeNote(Note $note): static
    {
        if ($this->notes->removeElement($note)) {
            if ($note->getOwner() === $this) {
                $note->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Entry>
     */
    public function getEntries(): Collection
    {
        return $this->entries;
    }

    public function addEntry(Entry $entry): static
    {
        if (!$this->entries->contains($entry)) {
            $this->entries->add($entry);
            $entry->setOwner($this);
        }

        return $this;
    }

    public function removeEntry(Entry $entry): static
    {
        if ($this->entries->removeElement($entry)) {
            if ($entry->getOwner() === $this) {
                $entry->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TodoFile>
     */
    public function getTodoFiles(): Collection
    {
        return $this->todoFiles;
    }

    public function addTodoFile(TodoFile $todoFile): static
    {
        if (!$this->todoFiles->contains($todoFile)) {
            $this->todoFiles->add($todoFile);
            $todoFile->setOwner($this);
        }

        return $this;
    }

    public function removeTodoFile(TodoFile $todoFile): static
    {
        if ($this->todoFiles->removeElement($todoFile)) {
            if ($todoFile->getOwner() === $this) {
                $todoFile->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, NoteFile>
     */
    public function getNoteFiles(): Collection
    {
        return $this->noteFiles;
    }

    public function addNoteFile(NoteFile $noteFile): static
    {
        if (!$this->noteFiles->contains($noteFile)) {
            $this->noteFiles->add($noteFile);
            $noteFile->setOwner($this);
        }

        return $this;
    }

    public function removeNoteFile(NoteFile $noteFile): static
    {
        if ($this->noteFiles->removeElement($noteFile)) {
            if ($noteFile->getOwner() === $this) {
                $noteFile->setOwner(null);
            }
        }

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
            $entryMedium->setOwner($this);
        }

        return $this;
    }

    public function removeEntryMedium(EntryMedia $entryMedium): static
    {
        if ($this->entryMedia->removeElement($entryMedium)) {
            if ($entryMedium->getOwner() === $this) {
                $entryMedium->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Location>
     */
    public function getLocations(): Collection
    {
        return $this->locations;
    }

    public function addLocation(Location $location): static
    {
        if (!$this->locations->contains($location)) {
            $this->locations->add($location);
            $location->setOwner($this);
        }

        return $this;
    }

    public function removeLocation(Location $location): static
    {
        if ($this->locations->removeElement($location)) {
            if ($location->getOwner() === $this) {
                $location->setOwner(null);
            }
        }

        return $this;
    }

    public function getEmailVerifiedAt(): ?\DateTimeImmutable
    {
        return $this->emailVerifiedAt;
    }

    public function setEmailVerifiedAt(?\DateTimeImmutable $emailVerifiedAt): static
    {
        $this->emailVerifiedAt = $emailVerifiedAt;
        return $this;
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerifiedAt !== null;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(?bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getJournalPasscode(): ?string
    {
        return $this->journalPasscode;
    }

    public function setJournalPasscode(?string $journalPasscode): static
    {
        $this->journalPasscode = $journalPasscode;
        return $this;
    }

    public function hasJournalPasscode(): bool
    {
        return $this->journalPasscode !== null;
    }

    public function getJCodeToken(): ?string
    {
        return $this->jCodeToken;
    }

    public function setJCodeToken(?string $jCodeToken): static
    {
        $this->jCodeToken = $jCodeToken;

        return $this;
    }
}
