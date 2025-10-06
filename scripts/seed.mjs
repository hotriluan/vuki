import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

// Local prisma client (avoid depending on TS source modules for seeding)
const prisma = new PrismaClient({ log: ['error'] });

// Inline categories (mirror src/lib/data.ts)
const seedCategories = [
  { id: 'c-sneakers', name: 'Sneakers', slug: 'sneakers' },
  { id: 'c-boots', name: 'Boots', slug: 'boots' },
  { id: 'c-accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'c-limited', name: 'Limited', slug: 'limited' }
];

// Load products.json directly
const require = createRequire(import.meta.url);
let rawProducts = [];
try {
  rawProducts = require('../src/lib/products.json');
} catch {}
const seedProducts = rawProducts.map(p => ({ createdAt: new Date().toISOString(), ...p }));

// Lightweight blog post loader (optional) – replicate minimal logic just for initial seed
function loadMarkdownPosts(dir = path.join(process.cwd(), 'content', 'posts')) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const f of files) {
    try {
      const abs = path.join(dir, f);
      const raw = fs.readFileSync(abs, 'utf8');
      const matchFront = /^---[\s\S]*?---/m.exec(raw);
      let front = {};
      let body = raw;
      if (matchFront) {
        const fmBlock = matchFront[0];
        body = raw.slice(fmBlock.length);
        // naive key: value parser
        fmBlock.split(/\n/).forEach(line => {
          if (line.startsWith('---') || !line.includes(':')) return;
          const [k, ...rest] = line.split(':');
          front[k.trim()] = rest.join(':').trim();
        });
      }
      const slug = front.slug || f.replace(/\.md$/, '').replace(/^[0-9]{4}-[0-9]{2}-/, '');
      const title = front.title || slug;
      const excerpt = front.excerpt || '';
      const publishedAt = front.publishedAt || new Date().toISOString();
      posts.push({ slug, title, excerpt, html: body, tags: [], publishedAt });
    } catch {}
  }
  return posts;
}

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
    // Compute product-level stock: sum variant stock if variants exist else 0 (or fallback 50?)
    const productLevelStock = p.variants?.length ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 0;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? null,
        featured: !!p.featured,
        images: p.images,
        stock: productLevelStock,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? null,
        featured: !!p.featured,
        images: p.images,
        stock: productLevelStock,
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

  // Seed blog posts (best-effort) if empty
  try {
    const count = await prisma.blogPost.count();
    if (count === 0) {
      const posts = loadMarkdownPosts();
      if (posts.length) {
        console.log('Seeding blog posts:', posts.length);
        for (const post of posts) {
          await prisma.blogPost.create({
            data: {
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              contentHtml: post.html,
              tags: [],
              publishedAt: new Date(post.publishedAt)
            }
          });
        }
      }
    }
  } catch (e) {
    console.warn('Skipping blog post seeding (error):', e.message);
  }

  console.log('Seed completed.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
