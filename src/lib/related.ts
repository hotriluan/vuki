import type { Product } from './types';
import { activeProductWhere } from './productVisibility';

// Try to dynamically query prisma for freshest non-deleted products if available (runtime server side)
async function loadActiveProducts(): Promise<Product[]> {
  try {
    // Lazy import; will fail client-side or if prisma not bundled
    const { prisma } = await import('./prisma');
    const now = new Date();
    const rows: any[] = await (prisma as any).product.findMany({
      where: activeProductWhere(now),
      take: 500,
      orderBy: { createdAt: 'desc' }
    });
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: r.price,
        salePrice: r.salePrice ?? undefined,
        categoryIds: (r.categories || []).map((c: any) => c.categoryId).filter(Boolean),
        images: Array.isArray(r.images) ? r.images : [],
        featured: r.featured,
        createdAt: r.createdAt.toISOString(),
        variants: (r.variants || []).map((v: any) => ({ id: v.id, label: v.label, priceDiff: v.priceDiff ?? undefined, stock: v.stock ?? undefined }))
      })) as Product[];
    }
  } catch {
    // ignore
  }
  return [] as Product[]; // fallback: no related products if dynamic fetch fails
}

export async function getRelatedProducts(base: Product, limit = 4): Promise<Product[]> {
  if (!base.categoryIds || base.categoryIds.length === 0) return [];
  const all = await loadActiveProducts();
  const cats = new Set(base.categoryIds);
  const pool = all.filter(p => p.id !== base.id && p.categoryIds?.some(c => cats.has(c)))
    .sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime());
  if (pool.length >= limit) return pool.slice(0, limit);
  const extra = all.filter(p => p.id !== base.id && !pool.find(x => x.id === p.id));
  return [...pool, ...extra].slice(0, limit);
}
