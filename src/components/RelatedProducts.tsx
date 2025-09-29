"use client";
import { useEffect, useState } from 'react';
import { productService } from '@/domain/product';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

export function RelatedProducts({ product }: { product: Product }) {
  const [related, setRelated] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    productService.related(product, 4).then(r => { if (active) setRelated(r); });
    return () => { active = false; };
  }, [product.id]);
  if (!related.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold mb-4">Related products</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {related.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
