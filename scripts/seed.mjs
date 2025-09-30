import { prisma } from '../src/lib/prisma.js';
import { categories as seedCategories, products as seedProducts } from '../src/lib/data.js';

async function main() {
  console.log('Seeding database...');

  // Upsert categories
  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  for (const p of seedProducts) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? null,
        featured: !!p.featured,
        images: p.images,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? null,
        featured: !!p.featured,
        images: p.images,
      }
    });

    // Connect categories
    if (p.categoryIds?.length) {
      for (const catId of p.categoryIds) {
        // Need to find category by ID in seed list then slug -> fetch DB row
        const catSeed = seedCategories.find(c => c.id === catId);
        if (!catSeed) continue;
        const cat = await prisma.category.findUnique({ where: { slug: catSeed.slug } });
        if (!cat) continue;
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: created.id, categoryId: cat.id } },
          update: {},
          create: { productId: created.id, categoryId: cat.id }
        });
      }
    }

    // Variants
    if (p.variants?.length) {
      for (const v of p.variants) {
        await prisma.productVariant.upsert({
          where: { id: v.id },
          update: { label: v.label, stock: v.stock, priceDiff: v.priceDiff ?? null, productId: created.id },
          create: { id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff ?? null, productId: created.id }
        });
      }
    }
  }

  console.log('Seed completed.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
