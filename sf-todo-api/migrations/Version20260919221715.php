<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260919221715 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE otprequest (id BINARY(16) NOT NULL, code VARCHAR(10) NOT NULL, purpose VARCHAR(30) NOT NULL, is_used TINYINT NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, owner_id BINARY(16) NOT NULL, INDEX IDX_648264237E3C61F9 (owner_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE todo (id BINARY(16) NOT NULL, name VARCHAR(200) NOT NULL, is_done TINYINT NOT NULL, due_date VARCHAR(20) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, description LONGTEXT DEFAULT NULL, owner_id BINARY(16) DEFAULT NULL, tag_id BINARY(16) DEFAULT NULL, INDEX IDX_5A0EB6A07E3C61F9 (owner_id), INDEX IDX_5A0EB6A0BAD26311 (tag_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE todo_tag (id BINARY(16) NOT NULL, name VARCHAR(50) DEFAULT NULL, color VARCHAR(20) DEFAULT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, owner_id BINARY(16) DEFAULT NULL, UNIQUE INDEX uniq_user_tag_color (owner_id, color), INDEX IDX_D767A0BA7E3C61F9 (owner_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (id BINARY(16) NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, username VARCHAR(90) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, email_verified_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME (username), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE otprequest ADD CONSTRAINT FK_648264237E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo ADD CONSTRAINT FK_5A0EB6A07E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE todo ADD CONSTRAINT FK_5A0EB6A0BAD26311 FOREIGN KEY (tag_id) REFERENCES todo_tag (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE todo_tag ADD CONSTRAINT FK_D767A0BA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE otprequest DROP FOREIGN KEY FK_648264237E3C61F9');
        $this->addSql('ALTER TABLE todo DROP FOREIGN KEY FK_5A0EB6A07E3C61F9');
        $this->addSql('ALTER TABLE todo DROP FOREIGN KEY FK_5A0EB6A0BAD26311');
        $this->addSql('ALTER TABLE todo_tag DROP FOREIGN KEY FK_D767A0BA7E3C61F9');
        $this->addSql('DROP TABLE otprequest');
        $this->addSql('DROP TABLE todo');
        $this->addSql('DROP TABLE todo_tag');
        $this->addSql('DROP TABLE user');
    }
}
