-- AlterTable
ALTER TABLE `Product` ADD COLUMN `published_at` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX `Product_status_published_at_idx` ON `Product`(`status`, `published_at`);
