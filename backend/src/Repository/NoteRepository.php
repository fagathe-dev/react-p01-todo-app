<?php

namespace App\Repository;

use App\Entity\Note;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<Note>
 */
class NoteRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Note::class);
    }

    public function save(Note $note, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation && $note->getCreatedAt() === null) {
            $note->setCreatedAt($now);
        }

        if (!$isCreation) {
            $note->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($note);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    public function remove(Note $note, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($note);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }


    //    /**
    //     * @return Note[] Returns an array of Note objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('n.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Note
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
