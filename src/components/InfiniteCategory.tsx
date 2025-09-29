"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { productsByCategorySlug } from '@/lib/data';
import { ProductCard } from './ProductCard';

interface InfiniteCategoryProps {
  slug: string;
  pageSize?: number;
}

export function InfiniteCategory({ slug, pageSize = 12 }: InfiniteCategoryProps) {
  const all = useMemo(() => productsByCategorySlug(slug), [slug]);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const totalPages = Math.ceil(all.length / pageSize) || 1;
  const items = all.slice(0, page * pageSize);
  const canLoadMore = page < totalPages;
  const [autoMode, setAutoMode] = useState(true);

  useEffect(() => {
    if (!autoMode) return;
    if (!canLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setPage(p => (p < totalPages ? p + 1 : p));
        }
      });
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [canLoadMore, totalPages, autoMode]);

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
        {canLoadMore && (
          <div className="col-span-full flex justify-center" ref={sentinelRef} aria-hidden>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-accent" />
          </div>
        )}
      </div>
      {canLoadMore && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 text-sm rounded border bg-white hover:bg-gray-50"
          >Tải thêm ({page}/{totalPages})</button>
          <button
            onClick={() => setAutoMode(m => !m)}
            className="text-[11px] text-gray-500 hover:text-gray-800"
          >Chế độ: {autoMode ? 'Tự động' : 'Thủ công'}</button>
        </div>
      )}
      {!canLoadMore && (
        <p className="text-center text-xs text-gray-500">Đã hết sản phẩm.</p>
      )}
    </div>
  );
}