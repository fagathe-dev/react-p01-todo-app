<?php

namespace App\Repository;

use App\Entity\EntryMedia;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<EntryMedia>
 */
class EntryMediaRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EntryMedia::class);
    }

    public function save(EntryMedia $entryMedia, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation && $entryMedia->getCreatedAt() === null) {
            $entryMedia->setCreatedAt($now);
        }

        if (!$isCreation) {
            $entryMedia->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($entryMedia);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    public function remove(EntryMedia $entryMedia, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($entryMedia);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    //    /**
    //     * @return EntryMedia[] Returns an array of EntryMedia objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?EntryMedia
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
