<?php

namespace App\Repository;

use App\Entity\TodoTag;
use App\Entity\User;
use App\Enum\Todo\TagColorEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Exception\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Fagathe\CorePhp\Trait\DatetimeTrait;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

/**
 * @extends ServiceEntityRepository<TodoTag>
 */
class TodoTagRepository extends ServiceEntityRepository
{
    use DatetimeTrait;
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TodoTag::class);
    }


    /**
     * Vérifie si un utilisateur possède déjà un tag avec cette couleur.
     */
    public function colorExistsForUser(User $owner, TagColorEnum|string $color, ?Uuid $excludeId = null): bool
    {
        // Sécurité : conversion en objet Enum si une string est passée
        if (is_string($color)) {
            $color = TagColorEnum::tryFrom($color);
            if ($color === null) {
                return false;
            }
        }

        $qb = $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->andWhere('t.owner = :ownerId') // On cible l'ID et non l'entité entière
            ->andWhere('t.color = :color')
            ->setParameter('ownerId', $owner->getId(), UuidType::NAME)
            ->setParameter('color', $color);

        if ($excludeId !== null) {
            $qb->andWhere('t.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    /**
     * Supprime un tag
     * @param TodoTag $tag L'entité à supprimer
     * @param bool $flush Faut-il exécuter la requête tout de suite ?
     * @return bool Succès de l'opération
     */
    public function remove(TodoTag $tag, bool $flush = true): bool
    {
        try {
            // Détachement explicite en mémoire pour les objets Todo déjà chargés
            foreach ($tag->getTodos() as $todo) {
                $todo->setTag(null);
            }

            $this->getEntityManager()->remove($tag);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException $ormException) {
            return false;
        }
    }

    /**
     * Sauvegarde un utilisateur (Création ou Mise à jour)
     * @param TodoTag $tag L'entité à sauvegarder
     * @param bool $flush Faut-il envoyer en base tout de suite ?
     * @return bool Succès de l'opération
     */
    public function save(TodoTag $tag, bool $flush = true, bool $isCreation = false): bool
    {
        $now = $this->now();

        if ($isCreation) {

            $tag->setCreatedAt($now);
        } else {
            $tag->setUpdatedAt($now);
        }

        try {
            $this->getEntityManager()->persist($tag);

            if ($flush) {
                $this->getEntityManager()->flush();
            }

            return true;
        } catch (ORMException $ormException) {
            return false;
        }
    }

    //    /**
    //     * @return TodoTag[] Returns an array of TodoTag objects
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

    //    public function findOneBySomeField($value): ?TodoTag
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
