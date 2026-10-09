<?php

namespace App\Repository;

use App\Entity\Location;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<Location>
 */
class LocationRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Location::class);
    }

    public function save(Location $location, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation && method_exists($location, 'setCreatedAt') && method_exists($location, 'getCreatedAt') && $location->getCreatedAt() === null) {
            $location->setCreatedAt($now);
        }

        if (!$isCreation && method_exists($location, 'setUpdatedAt')) {
            $location->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($location);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    public function remove(Location $location, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($location);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    //    /**
    //     * @return Location[] Returns an array of Location objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('l.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Location
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
