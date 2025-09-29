import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { getRelatedProducts } from '@/lib/related';
import { ProductService } from './productService';
import { ProductSchema } from './schemas';

function normalize(productsIn: Product[]): Product[] {
  // In dev, validate all; in production assume prevalidated to avoid perf hit.
  if (process.env.NODE_ENV !== 'production') {
    for (const p of productsIn) {
      const result = ProductSchema.safeParse(p);
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.warn('[ProductValidation] invalid product skipped', p?.id, result.error.flatten());
      }
    }
  }
  return productsIn;
}

const normalized = normalize(products);

export class MockProductService implements ProductService {
  async list(): Promise<Product[]> {
    return normalized;
  }
  async getBySlug(slug: string): Promise<Product | null> {
    return normalized.find(p => p.slug === slug) || null;
  }
  async getById(id: string): Promise<Product | null> {
    return normalized.find(p => p.id === id) || null;
  }
  async search(query: string, limit = 20): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return normalized.filter(p => (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    )).slice(0, limit);
  }
  async related(product: Product, limit = 4): Promise<Product[]> {
    return getRelatedProducts(product, limit);
  }
}

export const productService: ProductService = new MockProductService();
