// Provides a lightweight prisma client for tests when real DATABASE_URL is absent.
// If TEST_USE_SQLITE=1 and DATABASE_URL is missing, we dynamically load a sqlite client.

import { PrismaClient } from '@prisma/client';

let testPrisma: PrismaClient | null = null;

export function getPrismaForTests(): PrismaClient | null {
  if (process.env.DATABASE_URL) return null; // real DB configured, use normal client
  if (process.env.TEST_DISABLE_DB === '1') return null; // explicit disable
  if (!process.env.TEST_DATABASE_URL) {
    // Provide ephemeral file path default
    process.env.TEST_DATABASE_URL = 'file:./test.sqlite';
  }
  if (!testPrisma) {
    // We rely on same generated client; ensure `prisma generate --schema=prisma/schema.test.prisma` ran beforehand.
    testPrisma = new PrismaClient();
  }
  return testPrisma;
}
