#!/usr/bin/env node
// Seed admin user for NextAuth (idempotent)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'Admin@123';
const name = process.env.ADMIN_NAME || 'Admin';
const role = 'ADMIN';

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: hash, role },
    create: { email, name, passwordHash: hash, role }
  });
  console.log(`Seeded admin: ${user.email} (role: ${user.role})`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
