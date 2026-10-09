<?php

namespace App\Repository;

use App\Entity\NoteFile;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;

/**
 * @extends ServiceEntityRepository<NoteFile>
 */
class NoteFileRepository extends ServiceEntityRepository
{
    use DatetimeTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NoteFile::class);
    }

    public function save(NoteFile $noteFile, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation && $noteFile->getCreatedAt() === null) {
            $noteFile->setCreatedAt($now);
        }

        if (!$isCreation) {
            $noteFile->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($noteFile);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    public function remove(NoteFile $noteFile, bool $flush = true): bool
    {
        try {
            $this->getEntityManager()->remove($noteFile);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException) {
            return false;
        }
    }

    //    /**
    //     * @return NoteFile[] Returns an array of NoteFile objects
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

    //    public function findOneBySomeField($value): ?NoteFile
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
