// Reusable unified search index builder for products + blog posts
// Extracted from scripts/build-unified-search-index.mjs so runtime admin endpoint can reuse.
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { activeProductWhere } from './productVisibility.js';

export interface UnifiedRecord {
  id: string;
  type: 'product' | 'blog';
  name: string;
  description: string;
  slug: string;
  featured?: boolean;
}

async function loadProducts(): Promise<any[]> {
  // Prefer live DB (excluding soft-deleted)
  try {
    const { prisma } = await import('./prisma');
    const now = new Date();
    const rows: any[] = await (prisma as any).product.findMany({
      where: activeProductWhere(now),
      include: { categories: true },
      orderBy: { createdAt: 'desc' },
      take: 2000
    });
    if (rows && rows.length) {
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        slug: r.slug,
        featured: r.featured,
        categoryIds: (r.categories || []).map((c: any) => c.categoryId),
        createdAt: r.createdAt?.toISOString?.() || ''
      }));
    }
  } catch {}
  // Fallback legacy JSON/static modules
  const jsonFallback = path.join(process.cwd(), 'src', 'lib', 'products.json');
  if (fs.existsSync(jsonFallback)) {
    try {
      const raw = fs.readFileSync(jsonFallback, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  const candidates = [
    path.join(process.cwd(), 'dist', 'lib', 'data.js'),
    path.join(process.cwd(), 'src', 'lib', 'data.ts'),
    path.join(process.cwd(), 'src', 'lib', 'data.js')
  ];
  // NOTE: The dynamic import below uses a runtime-generated file URL.
  // In Next.js bundling this triggers the warning:
  //   Critical dependency: the request of a dependency is an expression
  // because webpack cannot statically analyze the target. This is acceptable for
  // build-time / script usage. If you want to silence the warning, replace the
  // loop with explicit conditional static imports, e.g.:
  //   if (fs.existsSync(candidates[0])) await import('dist/lib/data.js');
  // but keeping the loop keeps the code DRY and only runs in Node (never client).
  for (const abs of candidates) {
    try {
      if (fs.existsSync(abs)) {
        const mod = await import(pathToFileUrl(abs));
        if ((mod as any).products && Array.isArray((mod as any).products)) return (mod as any).products;
      }
    } catch {}
  }
  return [];
}

async function loadMarkdownBlogPosts(): Promise<any[]> {
  try {
    const blogMod = await import('./blog');
    if (typeof (blogMod as any).getAllPosts === 'function') return (blogMod as any).getAllPosts();
  } catch {}
  return [];
}

interface BlogRowLike { slug: string; title: string; excerpt?: string | null; publishedAt?: Date | null }

async function loadDbBlogPosts(): Promise<any[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { prisma } = await import('./prisma');
    const rows: BlogRowLike[] = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 500
    });
    return rows.map((r: BlogRowLike) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || '',
      publishedAt: r.publishedAt?.toISOString?.() || ''
    }));
  } catch (e) {
    return [];
  }
}

function toProductRecords(products: any[]): UnifiedRecord[] {
  return products.map(p => ({
    id: p.id,
    type: 'product' as const,
    name: p.name,
    description: String(p.description || '').slice(0, 400),
    slug: p.slug,
    featured: !!p.featured
  }));
}

function toBlogRecords(posts: any[]): UnifiedRecord[] {
  return posts.map(b => ({
    id: `blog:${b.slug}`,
    type: 'blog' as const,
    name: b.title,
    description: String(b.excerpt || '').slice(0, 400),
    slug: b.slug
  }));
}

export interface BuildResult { records: UnifiedRecord[]; counts: { products: number; blog: number }; version: string; generatedAt: string; }

export async function buildUnifiedSearchRecords(): Promise<BuildResult> {
  const [products, dbPosts, mdPosts] = await Promise.all([
    loadProducts(),
    loadDbBlogPosts(),
    loadMarkdownBlogPosts()
  ]);
  const blogSource = dbPosts.length > 0 ? dbPosts : mdPosts;
  const records = [...toProductRecords(products), ...toBlogRecords(blogSource)];
  records.sort((a, b) => a.id.localeCompare(b.id));
  const hash = crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex').slice(0, 16);
  const generatedAt = new Date().toISOString();
  return { records, counts: { products: products.length, blog: blogSource.length }, version: hash, generatedAt };
}

export function writeUnifiedSearchIndex(records: UnifiedRecord[], baseDir = process.cwd(), meta?: { version: string; generatedAt: string; counts: { products: number; blog: number } }) {
  const outDir = path.join(baseDir, 'public');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(records, null, 0), 'utf8');
  if (meta) {
    const metaPath = path.join(outDir, 'search-index.meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  }
  return outPath;
}

// Helper to convert absolute path to file URL for dynamic import when using Windows paths.
function pathToFileUrl(p: string) {
  let resolved = path.resolve(p).replace(/\\/g, '/');
  if (!resolved.startsWith('file://')) resolved = 'file://' + resolved;
  return resolved;
}
