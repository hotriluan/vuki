import type { CartState, AppliedCoupon } from '@/context/cartCore';
import type { Product } from '@/lib/types';

export interface PricingContext {
  state: CartState;
  products: Product[];
  baseShipping: number;
  vatEnabled: boolean;
  vatRate: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export type PricingRule = (ctx: PricingContext) => PricingContext;

// Helpers gốc copy/adapt từ cartCore để tách thành rule nhỏ.
function computeLineSubtotal(state: CartState, products: Product[]): number {
  return state.items.reduce((sum, it) => {
    const p = products.find(p => p.id === it.productId);
    if (!p) return sum;
    let base = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    if (it.variantId && p.variants) {
      const v = p.variants.find(v => v.id === it.variantId);
      if (v) {
        if (typeof v.overridePrice === 'number') base = v.overridePrice;
        else if (typeof v.priceDiff === 'number') base += v.priceDiff;
      }
    }
    return sum + base * it.quantity;
  }, 0);
}

function computeCouponDiscount(subtotal: number, coupon?: AppliedCoupon | null): number {
  if (!coupon) return 0;
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.kind === 'percent') return Math.floor((subtotal * coupon.value) / 100);
  return Math.min(coupon.value, subtotal);
}

// Các rule
export const ruleSubtotal: PricingRule = (ctx) => ({ ...ctx, subtotal: computeLineSubtotal(ctx.state, ctx.products) });
export const ruleDiscount: PricingRule = (ctx) => ({ ...ctx, discountAmount: computeCouponDiscount(ctx.subtotal, ctx.state.coupon) });
export const ruleShipping: PricingRule = (ctx) => {
  const after = ctx.subtotal - ctx.discountAmount;
  const shippingFee = after <= 0 ? 0 : (after >= 1_000_000 ? 0 : ctx.baseShipping);
  return { ...ctx, shippingFee };
};
export const ruleTax: PricingRule = (ctx) => {
  const baseForTax = Math.max(0, ctx.subtotal - ctx.discountAmount);
  const tax = ctx.vatEnabled ? Math.floor(baseForTax * ctx.vatRate) : 0;
  return { ...ctx, tax };
};
export const ruleTotal: PricingRule = (ctx) => {
  const baseForTax = Math.max(0, ctx.subtotal - ctx.discountAmount);
  const total = Math.max(0, baseForTax + ctx.shippingFee + ctx.tax);
  return { ...ctx, total };
};

export const defaultPricingPipeline: PricingRule[] = [
  ruleSubtotal,
  ruleDiscount,
  ruleShipping,
  ruleTax,
  ruleTotal
];

export interface ComputeTotalsOptions { baseShipping?: number; vatEnabled?: boolean; vatRate?: number; pipeline?: PricingRule[] }

export function runPricingPipeline(state: CartState, products: Product[], options?: ComputeTotalsOptions) {
  let ctx: PricingContext = {
    state,
    products,
    baseShipping: options?.baseShipping ?? 30_000,
    vatEnabled: options?.vatEnabled ?? true,
    vatRate: options?.vatRate ?? 0.1,
    subtotal: 0,
    discountAmount: 0,
    shippingFee: 0,
    tax: 0,
    total: 0
  };
  const pipeline = options?.pipeline || defaultPricingPipeline;
  for (const rule of pipeline) {
    ctx = rule(ctx);
  }
  return { subtotal: ctx.subtotal, discountAmount: ctx.discountAmount, shippingFee: ctx.shippingFee, tax: ctx.tax, total: ctx.total };
}
