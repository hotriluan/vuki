import type { Product } from '@/lib/types';

export interface ProductService {
  list(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  search(query: string, limit?: number): Promise<Product[]>; // lightweight contains search (mock)
  related(product: Product, limit?: number): Promise<Product[]>;
}
