<?php

namespace App\Repository;

use App\Entity\TodoFile;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<TodoFile>
 */
class TodoFileRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TodoFile::class);
    }

    public function save(TodoFile $todoFile, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation && $todoFile->getCreatedAt() === null) {
            $todoFile->setCreatedAt($now);
        }

        if (!$isCreation) {
            $todoFile->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($todoFile);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    public function remove(TodoFile $todoFile, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($todoFile);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }


    //    /**
    //     * @return TodoFile[] Returns an array of TodoFile objects
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

    //    public function findOneBySomeField($value): ?TodoFile
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
