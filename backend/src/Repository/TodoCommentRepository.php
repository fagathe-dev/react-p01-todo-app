<?php

namespace App\Repository;

use App\Entity\TodoComment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<TodoComment>
 */
class TodoCommentRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TodoComment::class);
    }

    /**
     * Sauvegarde un commentaire (Création ou Mise à jour).
     */
    public function save(TodoComment $comment, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation) {
            $comment->setCreatedAt($now);
        } else {
            $comment->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($comment);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    /**
     * Supprime un commentaire.
     */
    public function remove(TodoComment $comment, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($comment);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }


    //    /**
    //     * @return TodoComment[] Returns an array of TodoComment objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('t.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?TodoComment
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
