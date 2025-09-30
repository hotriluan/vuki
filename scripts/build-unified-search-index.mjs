import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadProducts() {
  // Try dist first
  const candidates = [
    '../dist/lib/data.js',
    '../src/lib/data.ts',
    '../src/lib/data.js'
  ];
  for (const rel of candidates) {
    try {
      const mod = await import(rel);
      if (mod.products && Array.isArray(mod.products)) return mod.products;
    } catch {}
  }
  console.warn('[search-build] products not found, returning empty');
  return [];
}

async function loadMarkdownBlogPosts() {
  try {
    const blogMod = await import('../src/lib/blog.ts');
    if (typeof blogMod.getAllPosts === 'function') return blogMod.getAllPosts();
  } catch {}
  return [];
}

async function loadDbBlogPosts() {
  // Optional: only if DATABASE_URL available & prisma client accessible
  if (!process.env.DATABASE_URL) return [];
  try {
    const { prisma } = await import('../src/lib/prisma.ts');
    const rows = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 500
    });
    return rows.map(r => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || '',
      publishedAt: r.publishedAt.toISOString()
    }));
  } catch (e) {
    console.warn('[search-build] DB blog fetch failed (ignored)', e?.message || e);
    return [];
  }
}

function toProductRecords(products) {
  return products.map(p => ({
    id: p.id,
    type: 'product',
    name: p.name,
    description: String(p.description || '').slice(0, 400),
    slug: p.slug,
    featured: !!p.featured
  }));
}

function toBlogRecords(posts) {
  return posts.map(b => ({
    id: `blog:${b.slug}`,
    type: 'blog',
    name: b.title,
    description: String(b.excerpt || '').slice(0, 400),
    slug: b.slug
  }));
}

async function build() {
  const [products, dbPosts, mdPosts] = await Promise.all([
    loadProducts(),
    loadDbBlogPosts(),
    loadMarkdownBlogPosts()
  ]);
  // DB posts ưu tiên, nếu rỗng fallback markdown
  const blogSource = dbPosts.length > 0 ? dbPosts : mdPosts;
  const records = [
    ...toProductRecords(products),
    ...toBlogRecords(blogSource)
  ];
  // Sắp xếp deterministic để cache diff nhỏ
  records.sort((a, b) => a.id.localeCompare(b.id));
  const outPath = path.join(__dirname, '..', 'public', 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(records, null, 0), 'utf8');
  console.log('[search-build] records:', records.length, 'products:', products.length, 'blog:', blogSource.length);
}

build().catch(e => {
  console.error('[search-build] failed', e);
  process.exitCode = 1;
});
