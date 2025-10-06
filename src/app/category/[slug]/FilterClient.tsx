"use client";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { filterAndSortProducts } from '@/lib/filter';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal, useQuickView } from '@/components/QuickViewModal';
import { productsByCategorySlug } from '@/lib/data';

interface FilterClientProps { slug: string; initial: Awaited<ReturnType<typeof productsByCategorySlug>>; }

export function FilterClient({ slug, initial }: FilterClientProps) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { selectedProduct, isOpen, openQuickView, closeQuickView } = useQuickView();

  const sort = params.get('sort') || 'newest';
  const min = parseInt(params.get('min') || '0', 10) || 0;
  const max = parseInt(params.get('max') || '0', 10) || 0; // 0 = no upper bound
  const sizesParam = params.get('sizes') || '';
  const selectedSizes = useMemo(() => (
    sizesParam ? sizesParam.split(',').filter(Boolean) : []
  ), [sizesParam]);

  const variantPool = useMemo(() => {
    const map = new Map<string, { id: string; label: string; stock: number | undefined }>();
    initial.forEach((p: any) => {
      p.variants?.forEach((v: any) => {
        if (!map.has(v.id)) map.set(v.id, { id: v.id, label: v.label, stock: v.stock });
      });
    });
    return Array.from(map.values()).sort((a,b) => a.label.localeCompare(b.label));
  }, [initial]);

  const filtered = useMemo(() => filterAndSortProducts(initial as any, { sort: sort as any, min, max, sizes: selectedSizes }), [initial, sort, min, max, selectedSizes]);

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value) sp.delete(key); else sp.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`);
    });
  }

  function toggleSize(id: string) {
    const next = new Set(selectedSizes);
    if (next.has(id)) next.delete(id); else next.add(id);
    const value = Array.from(next).join(',');
    updateParam('sizes', value);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={e => e.preventDefault()}
        className="flex flex-wrap gap-4 items-end border-b pb-4 mb-4 text-xs"
      >
        <div className="flex flex-col gap-1">
          <label className="font-medium">Sort</label>
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Min (₫)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            defaultValue={min || ''}
            onBlur={e => updateParam('min', e.target.value)}
            className="w-32 border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Max (₫)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            defaultValue={max || ''}
            onBlur={e => updateParam('max', e.target.value)}
            className="w-32 border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="font-medium">Sizes</span>
            <div className="flex flex-wrap gap-2">
              {variantPool.map(v => {
                const active = selectedSizes.includes(v.id);
                const disabled = (v.stock !== undefined && v.stock === 0);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => !disabled && toggleSize(v.id)}
                    disabled={disabled}
                    className={`px-2 py-1 rounded border text-[11px] relative ${
                      active ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-white dark:bg-gray-800 dark:border-gray-700'
                    } ${disabled && !active ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                    aria-pressed={active}
                    aria-disabled={disabled}
                    title={disabled ? 'Hết hàng' : undefined}
                  >
                    {v.label}
                    {v.stock !== undefined && (
                      <span className="ml-1 text-[9px] text-gray-500">{v.stock === 0 ? '0' : v.stock}</span>
                    )}
                  </button>
                );
              })}
              {variantPool.length === 0 && (
                <span className="text-[10px] text-gray-500">No variants</span>
              )}
            </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const sp = new URLSearchParams(params.toString());
            ['sort','min','max','sizes'].forEach(k => sp.delete(k));
            router.replace(`${pathname}`);
          }}
          className="ml-auto border rounded px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
        >Reset</button>
        {isPending && <span className="text-[10px] text-gray-500 animate-pulse">Updating…</span>}
      </form>
      {filtered.length === 0 && (
        <p className="text-sm text-gray-500">No products match filters.</p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p: Product) => (
          <ProductCard key={p.id} product={p} onQuickView={openQuickView} />
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeQuickView}
      />
    </div>
  );
}
