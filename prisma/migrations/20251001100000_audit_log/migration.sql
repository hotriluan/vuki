-- AuditLog table creation
CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `meta` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AuditLog_createdAt_idx` (`createdAt`),
  INDEX `AuditLog_action_idx` (`action`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;