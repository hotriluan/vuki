"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { findProductById } from '@/lib/data';
import { formatVnd } from '@/lib/currency';

export default function CartPage() {
  const { state, setQty, remove, clear, applyCoupon, removeCoupon, coupon, shippingFee, discountAmount, subtotal, total } = useCart() as any;
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
      <h1 className="text-2xl font-semibold mb-6">Giỏ hàng</h1>
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
        <aside className="sticky top-4 space-y-4 rounded border p-5 bg-white shadow-sm">
          <h2 className="font-medium mb-2">Tổng quan</h2>
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{formatVnd(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Giảm giá</span>
              <span>-{formatVnd(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-600">
            <span>Phí ship</span>
            <span>{shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}</span>
          </div>
          <CouponForm />
          <hr />
          <div className="flex justify-between font-semibold text-sm">
            <span>Tổng</span>
            <span>{formatVnd(total)}</span>
          </div>
          <button className="w-full mt-4 rounded bg-brand-accent px-4 py-3 text-white text-sm font-medium hover:brightness-110 disabled:opacity-60" disabled={itemsDetailed.length === 0}>
            Thanh toán (demo)
          </button>
          <button
            onClick={() => clear()}
            className="w-full text-xs text-gray-500 underline hover:text-gray-700"
            disabled={itemsDetailed.length === 0}
          >Xoá toàn bộ</button>
        </aside>
      </div>
    </div>
  );
}

function CouponForm() {
  const { state, applyCoupon, removeCoupon, discountAmount, subtotal } = useCart() as any;
  const has = !!state.coupon;
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('coupon') as HTMLInputElement;
    const code = input.value;
    if (!code) return;
    const res = applyCoupon(code);
    if (!res.ok) {
      input.setCustomValidity(res.reason || 'Không áp dụng được');
      input.reportValidity();
      setTimeout(() => input.setCustomValidity(''), 1500);
    } else {
      input.value = '';
    }
  };
  return (
    <div className="space-y-2">
      {!has && (
        <form onSubmit={handle} className="flex gap-2">
          <input name="coupon" placeholder="Mã giảm giá" className="flex-1 rounded border px-2 py-1 text-xs" />
          <button className="rounded bg-gray-900 text-white px-3 text-xs hover:brightness-110">Áp dụng</button>
        </form>
      )}
      {has && (
        <div className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
          <span className="truncate max-w-[140px]">Mã: {state.coupon.code}</span>
          <button onClick={removeCoupon} className="text-red-600 hover:underline">Huỷ</button>
        </div>
      )}
      {has && discountAmount === 0 && (
        <p className="text-[11px] text-orange-600">Chưa đạt điều kiện áp dụng (tạm tính {formatVnd(subtotal)})</p>
      )}
    </div>
  );
}
