#!/usr/bin/env node
// Migrate products & categories from JSON file to Prisma DB (idempotent)
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const jsonPath = path.join(__dirname, '..', 'src', 'lib', 'products.json');
  const raw = await readFile(jsonPath, 'utf8');
  const products = JSON.parse(raw);

  // Ensure base categories from code (mirrors data.ts)
  const categorySeeds = [
    { id: 'c-sneakers', slug: 'sneakers', name: 'Sneakers' },
    { id: 'c-boots', slug: 'boots', name: 'Boots' },
    { id: 'c-accessories', slug: 'accessories', name: 'Accessories' },
    { id: 'c-limited', slug: 'limited', name: 'Limited' }
  ];

  for (const c of categorySeeds) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, slug: c.slug },
      create: { id: c.id, name: c.name, slug: c.slug }
    });
  }

  for (const p of products) {
    const { id, slug, name, description, price, salePrice, images, featured, categoryIds = [], variants = [] } = p;
    await prisma.product.upsert({
      where: { slug },
      update: { name, description, price, salePrice, images, featured: !!featured },
      create: { id, slug, name, description, price, salePrice, images, featured: !!featured }
    });

    // Sync categories (delete existing join rows then re-add)
    const prod = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (prod) {
      await prisma.productCategory.deleteMany({ where: { productId: prod.id } });
      for (const catId of categoryIds) {
        await prisma.productCategory.create({ data: { productId: prod.id, categoryId: catId } });
      }

      // Variants sync: naive replace
      await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            id: v.id,
            label: v.label,
            stock: v.stock ?? 0,
            priceDiff: v.priceDiff ?? null,
            productId: prod.id
          }
        });
      }
    }
  }

  console.log('Migration complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
