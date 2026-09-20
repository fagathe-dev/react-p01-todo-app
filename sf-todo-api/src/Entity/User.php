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
    #[Groups(['user.read'])]
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
     * @var Collection<int, TodoTag>
     */
    #[ORM\OneToMany(targetEntity: TodoTag::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $tags;

    /**
     * @var Collection<int, Todo>
     */
    #[ORM\OneToMany(targetEntity: Todo::class, mappedBy: 'owner', cascade: ['remove', 'persist'], orphanRemoval: true)]
    private Collection $todos;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $emailVerifiedAt = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->tags = new ArrayCollection();
        $this->todos = new ArrayCollection();
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
     * @return Collection<int, TodoTag>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(TodoTag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
            $tag->setOwner($this);
        }

        return $this;
    }

    public function removeTag(TodoTag $tag): static
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
}
