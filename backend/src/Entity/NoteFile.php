<?php

namespace App\Entity;

use App\Repository\NoteFileRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NoteFileRepository::class)]
class NoteFile extends AbstractFile
{
    #[ORM\ManyToOne(inversedBy: 'noteFiles')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Note $note = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $owner = null;

    public function getNote(): ?Note
    {
        return $this->note;
    }

    public function setNote(?Note $note): static
    {
        $this->note = $note;
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
