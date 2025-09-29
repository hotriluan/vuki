"use client";
import { useEffect, useState } from 'react';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
import { findProductById } from '@/lib/data';
import Link from 'next/link';
import { ProductImage } from './ProductImage';

export function RecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const entries = getRecentlyViewed();
    setIds(entries.map(e => e.id));
  }, []);
  if (ids.length === 0) return null;
  const products = ids
    .map(id => findProductById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof findProductById>>[];
  if (products.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold mb-4">Recently viewed</h2>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map(p => (
          <Link key={p.id} href={`/product/${p.slug}`} className="group block text-xs">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded border bg-gray-50">
              {p.images[0] && <ProductImage src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />}
            </div>
            <div className="mt-2 line-clamp-2 leading-snug group-hover:text-brand-accent">{p.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
