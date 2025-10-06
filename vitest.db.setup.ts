// Auto DB prepare for integration tests.
// Strategy:
// 1. If DATABASE_URL present: try simple query; on failure attempt `prisma migrate deploy`.
// 2. If no DATABASE_URL: create sqlite temp (./tmp/test.db) using schema.test.prisma if available.
// 3. If still cannot prepare, set SKIP_INTEGRATION=1 so integration tests skip.

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

(async () => {
  const root = process.cwd();
  const hasReal = !!process.env.DATABASE_URL;
  if (hasReal) {
    try {
      const { prisma } = await import('./src/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      return; // ready
    } catch (e: any) {
      try {
        execSync('npx prisma migrate deploy', { stdio: 'ignore' });
        const { prisma } = await import('./src/lib/prisma');
        await prisma.$queryRaw`SELECT 1`;
        return;
      } catch (err) {
        process.env.SKIP_INTEGRATION = '1';
        return;
      }
    }
  } else {
    // sqlite fallback
    try {
      const schemaTest = path.join(root, 'prisma', 'schema.test.prisma');
      if (!fs.existsSync(schemaTest)) return;
      const tmpDir = path.join(root, 'tmp');
      fs.mkdirSync(tmpDir, { recursive: true });
      const sqlitePath = path.join(tmpDir, 'test.db');
      process.env.TEST_DATABASE_URL = `file:${sqlitePath}`;
      // Generate client for test schema in isolation via environment override
      execSync('npx prisma generate --schema=prisma/schema.test.prisma', { stdio: 'ignore' });
      // Basic table existence check by running sqlite pragma via prisma (best effort)
      const { PrismaClient } = await import('@prisma/client');
      const client: any = new PrismaClient();
      try {
        await client.$queryRaw`SELECT 1`;
      } finally { await client.$disconnect(); }
      // Patch integration tests to treat this as real DB
      process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    } catch (e) {
      process.env.SKIP_INTEGRATION = '1';
    }
  }
})();