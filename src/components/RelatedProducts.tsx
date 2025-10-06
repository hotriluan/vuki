"use client";
import { useEffect, useState, useMemo } from 'react';
import { productService } from '@/domain/product';
import { ProductCard } from './ProductCard';
import { QuickViewModal, useQuickView } from './QuickViewModal';
import type { Product } from '@/lib/types';

export function RelatedProducts({ product }: { product: Product }) {
  const [related, setRelated] = useState<Product[]>([]);
  const { selectedProduct, isOpen, openQuickView, closeQuickView } = useQuickView();
  // Memo key dựa trên id để tránh re-fetch không cần thiết khi object identity thay đổi
  const pid = product.id;
  useEffect(() => {
    let active = true;
    productService.related(product, 4).then(r => { if (active) setRelated(r); });
    return () => { active = false; };
  }, [pid, product]);
  if (!related.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold mb-4">Related products</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {related.map(p => <ProductCard key={p.id} product={p} onQuickView={openQuickView} />)}
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeQuickView}
      />
    </section>
  );
}
