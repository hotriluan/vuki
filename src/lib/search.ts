// Chuyển sang lazy dynamic import để giảm bundle initial.
import type { Product } from './types';
let fuseInstance: any = null;
let fusePromise: Promise<any> | null = null;

async function buildFuse() {
  const [{ default: Fuse }, { products }] = await Promise.all([
    import('fuse.js'),
    import('./data')
  ]);
  return new Fuse(products, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'description', weight: 0.3 },
      { name: 'slug', weight: 0.1 }
    ],
    threshold: 0.38,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
  });
}

export async function ensureSearchReady() {
  if (fuseInstance) return fuseInstance;
  if (!fusePromise) fusePromise = buildFuse().then(f => (fuseInstance = f));
  return fusePromise;
}

export interface SearchResultItem {
  product: Product;
  highlights: { key: string; value: string; indices: Array<[number, number]> }[];
}

export async function searchProducts(query: string, limit = 8): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const fuse = await ensureSearchReady();
  const res = fuse.search(trimmed, { limit });
  return res.map((r: any) => ({
    product: r.item as Product,
    highlights: (r.matches || []).map((m: any) => ({
      key: m.key as string,
      value: String(m.value),
      indices: m.indices as Array<[number, number]>
    }))
  }));
}
