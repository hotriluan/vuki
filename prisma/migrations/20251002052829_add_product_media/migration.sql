-- CreateTable
CREATE TABLE `ProductMedia` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `alt` VARCHAR(500) NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
    `position` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductMedia_productId_idx`(`productId`),
    UNIQUE INDEX `ProductMedia_productId_position_key`(`productId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductMedia` ADD CONSTRAINT `ProductMedia_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
