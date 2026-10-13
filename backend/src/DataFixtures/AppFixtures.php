<?php

namespace App\DataFixtures;

use App\Entity\Entry;
use App\Entity\Note;
use App\Entity\Tag;
use App\Entity\Todo;
use App\Entity\User;
use App\Enum\Auth\RoleEnum;
use App\Enum\ColorEnum;
use App\Enum\MoodEnum;
use App\Enum\StateEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;

class AppFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');
        $slugger = new AsciiSlugger();
        $defaultPassword = 'Password123!';
        $defaultPasscode = password_hash('0000', PASSWORD_BCRYPT);
        $parisTz = new \DateTimeZone('Europe/Paris');

        $states = StateEnum::cases();
        $moods = MoodEnum::cases();

        for ($i = 0; $i < random_int(15, 30); $i++) {
            $user = new User();

            // Utilisateur fixe de test pour le premier compte
            if ($i === 0) {
                $user
                    ->setEmail('test@example.com')
                    ->setUsername('testuser')
                    ->setFirstname('Test')
                    ->setLastname('User')
                    ->setCreatedAt(new \DateTimeImmutable());
            } else {
                $user
                    ->setEmail($faker->unique()->safeEmail())
                    ->setUsername(substr($faker->unique()->userName() . $i, 0, 30))
                    ->setFirstname($faker->firstName())
                    ->setLastname($faker->lastName())
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-3 months', 'now')));
            }

            $user
                ->setRoles([RoleEnum::RoleUser->value])
                ->setPassword($this->hasher->hashPassword($user, $defaultPassword))
                ->setJournalPasscode($defaultPasscode)
                ->setIsVerified(true)
                ->setEmailVerifiedAt(new \DateTimeImmutable());

            // 1. Tags propres à l'utilisateur (respect de la contrainte unique owner + color)
            $availableColors = ColorEnum::cases();
            shuffle($availableColors);

            $tagCount = min(count($availableColors), $faker->numberBetween(3, 8));
            $userTags = [];

            for ($t = 0; $t < $tagCount; $t++) {
                $tag = new Tag();
                $tag
                    ->setName(ucfirst($faker->words($faker->numberBetween(1, 2), true)))
                    ->setDescription($faker->optional(0.7)->sentence())
                    ->setColor(array_pop($availableColors))
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-2 months', 'now')));

                $user->addTag($tag);
                $manager->persist($tag);
                $userTags[] = $tag;
            }

            // 2. Todos
            $todoCount = $faker->numberBetween(20, 30);
            for ($j = 0; $j < $todoCount; $j++) {
                $dueDate = null;
                if ($faker->boolean(80)) {
                    $dueDate = \DateTimeImmutable::createFromMutable(
                        $faker->dateTimeBetween('-5 days', '+12 days')
                    )->setTimezone($parisTz)->setTime(23, 59, 59);
                }

                $todo = new Todo();
                $todo
                    ->setName(rtrim($faker->sentence($faker->numberBetween(3, 6)), '.'))
                    ->setDescription($faker->optional(0.6)->paragraph(2))
                    ->setIsDone($faker->boolean(35))
                    ->setDueDate($dueDate)
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-1 month', 'now')));

                if ($faker->boolean(70) && !empty($userTags)) {
                    $todo->setTag($faker->randomElement($userTags));
                }

                $user->addTodo($todo);
                $manager->persist($todo);
            }

            // 3. Notes (70 % open, 20 % archived, 10 % trash via core-php)
            $noteCount = $faker->numberBetween(10, 20);
            for ($k = 0; $k < $noteCount; $k++) {
                $noteCreatedAt = \DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-2 months', 'now'));

                /** @var StateEnum $state */
                $state = random_choices(
                    [StateEnum::Open, StateEnum::Archieved, StateEnum::Trash],
                    [70, 20, 10]
                );

                // 20 % de chance d'être dans la corbeille (deleted_at non nul)
                $deletedAt = $faker->boolean(20)
                    ? \DateTimeImmutable::createFromMutable($faker->dateTimeBetween($noteCreatedAt->format('Y-m-d H:i:s'), 'now'))
                    : null;

                $note = new Note();
                $note
                    ->setTitle($faker->sentence($faker->numberBetween(2, 5)))
                    ->setContent($faker->paragraphs($faker->numberBetween(1, 4), true))
                    ->setState($state)
                    ->setColor(!empty($availableColors) ? $faker->optional(0.7)->randomElement(ColorEnum::cases()) : null)
                    ->setIsPinned($deletedAt === null && $faker->boolean(20))
                    ->setCreatedAt($noteCreatedAt)
                    ->setIsPinned(random_choices([true, false], [0.12, 0.88]))
                ;

                if ($note->getState() === StateEnum::Trash) $note->setDeletedAt($deletedAt);

                if ($faker->boolean(60) && !empty($userTags)) {
                    $note->setTag($faker->randomElement($userTags));
                }

                $user->addNote($note);
                $manager->persist($note);
            }

            // 4. Entrées de journal intime (Entry)
            $entryCount = $faker->numberBetween(10, 20);
            for ($m = 0; $m < $entryCount; $m++) {
                $title = $faker->optional(0.85)->sentence($faker->numberBetween(2, 5));
                $slug = $title ? $slugger->slug($title)->lower()->toString() : null;

                $entry = new Entry();
                $entry
                    ->setTitle($title)
                    ->setContent($faker->paragraphs($faker->numberBetween(2, 5), true))
                    ->setSlug($slug)
                    ->setColor($faker->optional(0.6)->randomElement(ColorEnum::cases()))
                    ->setMood(!empty($moods) ? $faker->optional(0.8)->randomElement($moods) : null)
                    ->setIsPinned($faker->boolean(15))
                    ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-2 months', 'now')));

                if ($faker->boolean(50) && !empty($userTags)) {
                    $entry->setTag($faker->randomElement($userTags));
                }

                $user->addEntry($entry);
                $manager->persist($entry);
            }

            $manager->persist($user);
        }

        $manager->flush();
    }
}
