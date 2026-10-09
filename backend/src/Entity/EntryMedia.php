<?php

namespace App\Entity;

use App\Repository\EntryMediaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EntryMediaRepository::class)]
class EntryMedia extends AbstractFile
{
    #[ORM\ManyToOne(inversedBy: 'entryMedia')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Entry $entry = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $owner = null;
    
    public function getEntry(): ?Entry
    {
        return $this->entry;
    }

    public function setEntry(?Entry $entry): static
    {
        $this->entry = $entry;
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
}