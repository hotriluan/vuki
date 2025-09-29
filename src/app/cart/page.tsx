"use client";
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { findProductById } from '@/lib/data';
import { formatVnd } from '@/lib/currency';
import PricingBreakdown from '@/components/cart/PricingBreakdown';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { state, setQty, remove, clear, applyCoupon, removeCoupon, coupon, shippingFee, discountAmount, subtotal, tax, total, vatEnabled, setVatEnabled, isCheckoutReady } = useCart() as any;
  const { t, locale, setLocale } = useLanguage();
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
      return {
        product,
        quantity: it.quantity,
        unitPrice: base,
        lineTotal: base * it.quantity,
        variantId: it.variantId,
        variantLabel
      };
    })
    .filter(Boolean) as Array<{ product: ReturnType<typeof findProductById>; quantity: number; unitPrice: number; lineTotal: number; variantId?: string | null; variantLabel?: string }>; 

  // subtotal now provided by context; itemsDetailed only used for rendering lines

  if (itemsDetailed.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Giỏ hàng trống</h1>
        <p className="text-gray-600 mb-6 text-sm">Chưa có sản phẩm nào. Khám phá bộ sưu tập và chọn đôi đầu tiên.</p>
        <Link href="/category/sneakers" className="inline-block rounded bg-brand-accent px-6 py-3 text-white text-sm font-medium hover:brightness-110">Xem Sneakers</Link>
        <div className="mt-3">
          <Link href="/" className="text-xs text-gray-600 underline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('cart')}</h1>
        <select value={locale} onChange={e => setLocale(e.target.value as any)} className="text-xs border rounded px-2 py-1">
          <option value="vi">VI</option>
          <option value="en">EN</option>
        </select>
      </div>
      <div className="grid gap-10 md:grid-cols-[1fr_300px] items-start">
        <div className="space-y-6">
          {itemsDetailed.map(({ product, quantity, unitPrice, lineTotal, variantId, variantLabel }) => (
            <div key={product!.id + (variantId || '')} className="flex flex-col sm:flex-row gap-4 border-b pb-6">
              <div className="w-28 h-32 relative shrink-0 overflow-hidden rounded bg-gray-100">
                {product!.images[0] && (
                  <Image
                    src={product!.images[0]}
                    alt={product!.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/product/${product!.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base leading-snug line-clamp-2">
                      {product!.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">Đơn giá: {formatVnd(unitPrice)}</div>
                    {variantLabel && (
                      <div className="text-[11px] text-gray-600 mt-0.5">Biến thể: {variantLabel}</div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(product!.id)}
                    className="text-xs text-red-600 hover:underline"
                    aria-label={`Xoá ${product!.name}`}
                  >Xoá</button>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center rounded border">
                    <button
                      onClick={() => setQty(product!.id, Math.max(1, quantity - 1))}
                      className="px-2 py-1 text-sm disabled:opacity-30"
                      disabled={quantity <= 1}
                      aria-label="Giảm số lượng"
                    >-</button>
                    <span className="w-10 text-center text-sm select-none">{quantity}</span>
                    <button
                      onClick={() => setQty(product!.id, quantity + 1)}
                      className="px-2 py-1 text-sm"
                      aria-label="Tăng số lượng"
                    >+</button>
                  </div>
                  <div className="text-sm font-medium">{formatVnd(lineTotal)}</div>
                </div>
              </div>
            </div>
          ))}
  </div>
  <MiniCheckoutForm />
        <aside className="sticky top-4 space-y-4 rounded border p-5 bg-white shadow-sm">
          <h2 className="font-medium mb-2">{t('total')}</h2>
          <PricingBreakdown
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            tax={tax}
            total={total}
            format={formatVnd}
            couponNode={<CouponForm />}
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
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-[11px] select-none">
              <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} />
              VAT 10%
            </label>
            {!isCheckoutReady && <span className="text-[10px] text-orange-600">{t('notReady')}</span>}
          </div>
          <button className="w-full rounded bg-brand-accent px-4 py-3 text-white text-sm font-medium hover:brightness-110 disabled:opacity-60" disabled={!isCheckoutReady}>
            {t('payDemo')}
          </button>
          <button
            onClick={() => clear()}
            className="w-full text-xs text-gray-500 underline hover:text-gray-700"
            disabled={itemsDetailed.length === 0}
          >Clear</button>
        </aside>
      </div>
    </div>
  );
}

function CouponForm() {
  const { state, applyCoupon, removeCoupon, discountAmount, subtotal } = useCart() as any;
  const { t } = useLanguage();
  const has = !!state.coupon;
  const [err, setErr] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<number>(Date.now());
  React.useEffect(() => {
    if (!has || !state.coupon?.expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [has, state.coupon?.expiresAt]);
  const expCountdown = React.useMemo(() => {
    if (!has || !state.coupon?.expiresAt) return null;
    const exp = Date.parse(state.coupon.expiresAt);
    const diff = exp - now;
    if (diff <= 0) return 'Đã hết hạn';
    if (diff > 24 * 3600 * 1000) return null; // Only show when <24h
    const h = Math.floor(diff / 3600_000);
    const m = Math.floor((diff % 3600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [has, state.coupon?.expiresAt, now]);
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('coupon') as HTMLInputElement;
    const code = input.value.trim();
    if (!code) return;
    const res = applyCoupon(code);
    if (!res.ok) {
      setErr(res.reason || 'Không áp dụng được');
      setTimeout(() => setErr(null), 1800);
    } else {
      input.value = '';
      setErr(null);
    }
  };
  return (
    <div className="space-y-2">
      {!has && (
        <form onSubmit={handle} className="flex gap-2">
          <input name="coupon" placeholder={t('coupon')} className="flex-1 rounded border px-2 py-1 text-xs" />
          <button className="rounded bg-gray-900 text-white px-3 text-xs hover:brightness-110">{t('apply')}</button>
        </form>
      )}
      {has && (
        <div className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
          <span className="truncate max-w-[140px]">Mã: {state.coupon.code}</span>
          <button onClick={removeCoupon} className="text-red-600 hover:underline">Huỷ</button>
        </div>
      )}
      {has && expCountdown && (
        <p className="text-[10px] text-gray-500">{t('countdownExpire')}: <span className="font-mono">{expCountdown}</span></p>
      )}
      {has && discountAmount === 0 && (
        <p className="text-[11px] text-orange-600">{t('couponNotQualified')} ({t('subtotal')} {formatVnd(subtotal)})</p>
      )}
      {err && <p className="text-[11px] text-red-600">{err}</p>}
    </div>
  );
}

function MiniCheckoutForm() {
  const { state, setCheckout, shippingFee, subtotal, discountAmount } = useCart() as any;
  const { t } = useLanguage();
  const checkout = state.checkout || { name: '', email: '', address: '', province: '' };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckout({ [name]: value });
  };
  const handleProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCheckout({ province: e.target.value });
  };
  const handleAddressBlur = () => {
    if (checkout.province) return; // user already selected
    if (!checkout.address) return;
  const segs = checkout.address.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (!segs.length) return;
    const last = segs[segs.length - 1].toLowerCase();
    // Simple heuristics mapping
    const map: Record<string, string> = {
      'hcm': 'TP Hồ Chí Minh',
      'tp hcm': 'TP Hồ Chí Minh',
      'tphcm': 'TP Hồ Chí Minh',
      'ho chi minh': 'TP Hồ Chí Minh',
      'hồ chí minh': 'TP Hồ Chí Minh',
      'hn': 'Hà Nội',
      'ha noi': 'Hà Nội',
      'hà nội': 'Hà Nội',
      'da nang': 'Đà Nẵng',
      'đà nẵng': 'Đà Nẵng'
    };
    const normalized = last.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    for (const key of Object.keys(map)) {
      const keyNorm = key.normalize('NFD').replace(/\p{Diacritic}/gu, '');
      if (normalized.includes(keyNorm)) {
        setCheckout({ province: map[key] });
        break;
      }
    }
  };
  return (
    <div className="md:col-span-2 order-last md:order-none mb-6 md:mb-0 max-w-xl">
  <h2 className="text-base font-medium mb-3">{t('checkoutInfo')}</h2>
      <div className="grid gap-3">
        <input name="name" value={checkout.name} onChange={handleChange} placeholder={t('name')} className="rounded border px-3 py-2 text-sm" />
        <input name="email" type="email" value={checkout.email} onChange={handleChange} placeholder={t('email')} className="rounded border px-3 py-2 text-sm" />
        <textarea name="address" value={checkout.address} onChange={handleChange} onBlur={handleAddressBlur} placeholder={t('address')} className="rounded border px-3 py-2 text-sm h-24 resize-none" />
        <select name="province" value={checkout.province} onChange={handleProvince} className="rounded border px-3 py-2 text-sm">
          <option value="">{t('selectProvince')}</option>
          <option>TP Hồ Chí Minh</option>
            <option>Hà Nội</option>
            <option>Đà Nẵng</option>
            <option>Khác</option>
        </select>
        <div className="text-[11px] text-gray-600">Phí ship ước tính: {shippingFee === 0 ? 'Miễn phí (đạt ngưỡng)' : formatVnd(shippingFee)}{subtotal - discountAmount >= 1_000_000 && shippingFee === 0 ? ' - đã đạt freeship' : ''}</div>
        <p className="text-[11px] text-gray-500">Dữ liệu chỉ lưu cục bộ (localStorage) – không gửi lên server.</p>
      </div>
    </div>
  );
}
