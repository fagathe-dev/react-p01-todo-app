<?php

namespace App\DataFixtures;

use App\Entity\Todo;
use App\Entity\TodoTag;
use App\Entity\User;
use App\Enum\Auth\RoleEnum;
use App\Enum\Todo\DueDateEnum;
use App\Enum\Todo\TagColorEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');
        $defaultPassword = 'Password123!';
        $allDueDates = DueDateEnum::cases();

        for ($i = 0; $i < 5; $i++) {
            $user = new User();

            // Le premier utilisateur est le compte de test fixe
            if ($i === 0) {
                $user
                    ->setEmail('test@example.com')
                    ->setUsername('testuser')
                    ->setCreatedAt(new \DateTimeImmutable());
            } else {
                $user
                    ->setEmail($faker->unique()->safeEmail())
                    ->setUsername(substr($faker->unique()->userName() . $i, 0, 30))
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-3 months', 'now')));
            }

            $user
                ->setRoles([RoleEnum::RoleUser->value])
                ->setPassword($this->hasher->hashPassword($user, $defaultPassword))
                ->setEmailVerifiedAt(new \DateTimeImmutable());

            // 1. Génération des tags propres à cet utilisateur
            $availableColors = TagColorEnum::cases();
            shuffle($availableColors);

            $tagCount = $faker->numberBetween(3, 6);
            $userTags = [];

            for ($t = 0; $t < $tagCount; $t++) {
                $tag = new TodoTag();
                $tag
                    ->setName(ucfirst($faker->words($faker->numberBetween(1, 2), true)))
                    ->setDescription($faker->optional(0.7)->sentence())
                    ->setColor(array_pop($availableColors))
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-2 months', 'now')));

                // Alimente la collection et associe l'owner
                $user->addTag($tag);

                $manager->persist($tag);
                $userTags[] = $tag;
            }

            // 2. Génération des todos rattachés à cet utilisateur
            $todoCount = $faker->numberBetween(10, 18);

            for ($j = 0; $j < $todoCount; $j++) {
                $todo = new Todo();
                $todo
                    ->setName(rtrim($faker->sentence($faker->numberBetween(3, 6)), '.'))
                    ->setDescription($faker->optional(0.6)->paragraph(2))
                    ->setIsDone($faker->boolean(35))
                    ->setDueDate($faker->optional(0.8)->randomElement($allDueDates))
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-1 month', 'now')));

                if ($faker->boolean(70) && !empty($userTags)) {
                    $todo->setTag($faker->randomElement($userTags));
                }

                // Alimente la collection et associe l'owner
                $user->addTodo($todo);

                $manager->persist($todo);
            }

            $manager->persist($user);
        }

        $manager->flush();
    }
}
