"use client";
import Link from 'next/link';
import { getRelatedProducts } from '@/lib/related';
import { findProductById } from '@/lib/data';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

export function RelatedProducts({ product }: { product: Product }) {
  const related = getRelatedProducts(product, 4);
  if (related.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold mb-4">Related products</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {related.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
