#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[check-db] Missing DATABASE_URL');
    process.exit(2);
  }
  const prisma = new PrismaClient();
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    // Probe a few expected tables (best effort)
    const tables = ['Product', 'Order', 'BlogPost'];
    const existing = [];
    for (const t of tables) {
      try { await prisma.$queryRawUnsafe(`SELECT 1 FROM ${t} LIMIT 1`); existing.push(t); } catch {}
    }
    const ms = Date.now() - start;
    console.log(`[check-db] OK latency=${ms}ms tables=${existing.join(',')}`);
  } catch (e) {
    console.error('[check-db] FAILED', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
