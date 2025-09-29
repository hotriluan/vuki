"use client";
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { findProductById } from '@/lib/data';
import PricingBreakdown from './PricingBreakdown';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import Image from 'next/image';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { state, setQty, remove, totalItems, subtotal, discountAmount, shippingFee, tax, total, vatEnabled, setVatEnabled, isCheckoutReady } = useCart() as any;
  const { format } = useCurrency();
  const { t, locale, setLocale } = useLanguage();
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Basic focus trap start focus
  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  }, [open]);

  const itemsDetailed = state.items
    .map((it: { productId: string; quantity: number; variantId?: string | null }) => {
      const product = findProductById(it.productId);
      if (!product) return null;
      let base = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
      let variantLabel: string | undefined;
      if (it.variantId && product.variants) {
        const v = product.variants.find(v => v.id === it.variantId);
        if (v) {
          variantLabel = v.label;
          if (typeof v.overridePrice === 'number') base = v.overridePrice;
          else if (typeof v.priceDiff === 'number') base = base + v.priceDiff;
        }
      }
      return { product, quantity: it.quantity, unitPrice: base, lineTotal: base * it.quantity, variantId: it.variantId, variantLabel };
    })
    .filter(Boolean) as Array<{ product: NonNullable<ReturnType<typeof findProductById>>; quantity: number; unitPrice: number; lineTotal: number; variantId?: string | null; variantLabel?: string }>;

  // subtotal, discount, shipping, total now from context

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label="Giỏ hàng"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b px-5 h-14">
          <h2 className="font-medium text-sm">{t('cart')} ({totalItems})</h2>
          <select value={locale} onChange={e => setLocale(e.target.value as any)} className="text-[10px] border rounded px-1 py-0.5 ml-2">
            <option value="vi">VI</option>
            <option value="en">EN</option>
          </select>
          <button onClick={onClose} aria-label="Đóng" className="text-xs hover:opacity-70">Đóng</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {itemsDetailed.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p>
          )}
          {itemsDetailed.map(({ product, quantity, unitPrice, lineTotal, variantId, variantLabel }) => (
            <div key={product.id + (variantId || '')} className="flex gap-3">
              <div className="relative w-16 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                )}
              </div>
              <div className="flex-1 flex flex-col text-xs">
                <Link href={`/product/${product.slug}`} className="font-medium line-clamp-2 hover:text-brand-accent">{product.name}</Link>
                <div className="mt-1">{format(unitPrice)}</div>
                {variantLabel && <div className="text-[10px] text-gray-600 mt-0.5">{variantLabel}</div>}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => setQty(product.id, Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-2 py-1 disabled:opacity-30"
                      aria-label="Giảm"
                    >-</button>
                    <span className="w-8 text-center select-none">{quantity}</span>
                    <button
                      onClick={() => setQty(product.id, quantity + 1)}
                      className="px-2 py-1"
                      aria-label="Tăng"
                    >+</button>
                  </div>
                  <span className="font-medium">{format(lineTotal)}</span>
                </div>
                <button
                  onClick={() => remove(product.id)}
                  className="mt-1 text-[11px] text-red-600 hover:underline self-start"
                  aria-label="Xoá sản phẩm"
                >Xoá</button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-5 space-y-3 text-sm">
          <PricingBreakdown
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            tax={tax}
            total={total}
            format={format}
            couponNode={<DrawerCoupon />}
            variant="drawer"
            vatRatePercent={10}
            labels={{
              subtotal: t('subtotal'),
              discount: t('discount'),
              shipping: t('shipping'),
              free: t('free'),
              total: t('total'),
              vat: (r) => `${t('vat')} (${r}%)`
            }}
          />
          <div className="flex items-center justify-between text-[10px]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} /> VAT
            </label>
            {!isCheckoutReady && <span className="text-orange-600">{t('notReady')}</span>}
          </div>
          <Link
            href="/cart"
            onClick={onClose}
            className="block w-full text-center bg-brand-accent text-white rounded py-3 text-sm font-medium hover:brightness-110"
          >{t('cart')}</Link>
          <button
            disabled={!isCheckoutReady}
            className="w-full rounded border py-2 text-xs hover:bg-gray-50 disabled:opacity-50"
          >{t('payDemo')}</button>
        </div>
      </div>
    </>
  );
}

function DrawerCoupon() {
  const { state, applyCoupon, removeCoupon, discountAmount, subtotal } = useCart() as any;
  const { format } = useCurrency();
  const { t } = useLanguage();
  const has = !!state.coupon;
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (!has || !state.coupon?.expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [has, state.coupon?.expiresAt]);
  const expCountdown = (() => {
    if (!has || !state.coupon?.expiresAt) return null;
    const exp = Date.parse(state.coupon.expiresAt);
    const diff = exp - now;
    if (diff <= 0) return 'Hết hạn';
    if (diff > 24 * 3600 * 1000) return null;
    const h = Math.floor(diff / 3600_000);
    const m = Math.floor((diff % 3600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  })();
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('coupon') as HTMLInputElement;
    const code = input.value.trim();
    if (!code) return;
    const res = applyCoupon(code);
    if (!res.ok) {
      setErr(res.reason || 'Không áp dụng');
      setTimeout(() => setErr(null), 1800);
    } else {
      input.value = '';
      setErr(null);
    }
  };
  return (
    <div className="space-y-1">
      {!has && (
        <form onSubmit={handle} className="flex gap-2 mt-1">
          <input name="coupon" placeholder={t('coupon')} className="flex-1 rounded border px-2 py-1 text-[11px]" />
          <button className="rounded bg-gray-900 text-white px-2 text-[11px]">{t('apply')}</button>
        </form>
      )}
      {has && (
        <div className="flex items-center justify-between text-[11px] bg-green-50 border border-green-200 rounded px-2 py-1">
          <span className="truncate max-w-[100px]">{state.coupon.code}</span>
          <button onClick={removeCoupon} className="text-red-600 hover:underline">Huỷ</button>
        </div>
      )}
      {has && expCountdown && (
        <p className="text-[10px] text-gray-500">{t('countdownExpire')}: <span className="font-mono">{expCountdown}</span></p>
      )}
      {has && discountAmount === 0 && (
        <p className="text-[10px] text-orange-600">{t('couponNotQualified')} ({t('subtotal')} {format(subtotal)})</p>
      )}
      {err && <p className="text-[10px] text-red-600">{err}</p>}
    </div>
  );
}
