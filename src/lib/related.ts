import { products } from './data';
import type { Product } from './types';

export function getRelatedProducts(base: Product, limit = 4): Product[] {
  if (!base.categoryIds || base.categoryIds.length === 0) return [];
  const cats = new Set(base.categoryIds);
  const pool = products.filter(p => p.id !== base.id && p.categoryIds?.some(c => cats.has(c)))
    .sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime());
  if (pool.length >= limit) return pool.slice(0, limit);
  // If not enough, optionally fill with other products not the base (excluding duplicates)
  const extra = products.filter(p => p.id !== base.id && !pool.find(x => x.id === p.id));
  return [...pool, ...extra].slice(0, limit);
}
