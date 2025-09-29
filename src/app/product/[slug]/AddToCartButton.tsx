"use client";
import { Product } from '@/lib/types';
import { useCart } from '../../../context/CartContext';
import { useState, useMemo } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const hasVariants = !!product.variants?.length;
  const firstAvailable = useMemo(() => product.variants?.find(v => (v.stock ?? 1) > 0)?.id, [product.variants]);
  const [variantId, setVariantId] = useState<string | null>(firstAvailable || null);
  const currentVariant = product.variants?.find(v => v.id === variantId);
  const disabled = hasVariants && !variantId;

  let displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  if (currentVariant) {
    if (typeof currentVariant.overridePrice === 'number') displayPrice = currentVariant.overridePrice;
    else if (typeof currentVariant.priceDiff === 'number') displayPrice = displayPrice + currentVariant.priceDiff;
  }

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-600">Chọn size</div>
          <div className="flex flex-wrap gap-2">
            {product.variants!.map(v => {
              const out = (v.stock ?? 0) <= 0;
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  onClick={() => !out && setVariantId(v.id)}
                  disabled={out}
                  className={`px-3 py-1 rounded border text-xs ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white'} ${out ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-900'}`}
                  aria-pressed={active}
                >{v.label}</button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={() => add(product, 1, variantId || undefined)}
          disabled={disabled}
          className="rounded bg-brand-accent px-6 py-3 text-white text-sm font-medium hover:brightness-110 disabled:opacity-50"
        >
          Add to Cart
        </button>
        <span className="text-sm text-gray-600">Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice)}</span>
      </div>
    </div>
  );
}
