import type { Product } from '@/lib/types';
import { runPricingPipeline } from '@/domain/cart/pricingPipeline';

export interface CartItem { productId: string; quantity: number; variantId?: string | null; }
export interface AppliedCoupon { code: string; kind: 'percent' | 'fixed'; value: number; minSubtotal?: number; expiresAt?: string; }
export interface CheckoutInfo { name: string; email: string; address: string; province?: string; }
export interface CartState { items: CartItem[]; coupon?: AppliedCoupon | null; checkout?: CheckoutInfo; }

export const COUPONS: AppliedCoupon[] = [
  { code: 'SALE10', kind: 'percent', value: 10, minSubtotal: 500_000, expiresAt: '2099-12-31T23:59:59Z' },
  { code: 'FREESHIP', kind: 'fixed', value: 30_000, minSubtotal: 300_000, expiresAt: '2099-12-31T23:59:59Z' },
  { code: 'VIP50K', kind: 'fixed', value: 50_000, minSubtotal: 800_000, expiresAt: '2099-12-31T23:59:59Z' },
  { code: 'OLD5', kind: 'percent', value: 5, minSubtotal: 0, expiresAt: '2000-01-01T00:00:00Z' }
];

export type Action =
  | { type: 'ADD'; productId: string; quantity?: number; variantId?: string | null }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'REPLACE'; state: CartState }
  | { type: 'APPLY_COUPON'; coupon: AppliedCoupon | null }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_CHECKOUT'; checkout: Partial<CheckoutInfo> };

export function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.productId === action.productId && i.variantId === action.variantId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.productId && i.variantId === action.variantId
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          )
        };
      }
      return { ...state, items: [...state.items, { productId: action.productId, variantId: action.variantId ?? null, quantity: action.quantity ?? 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
    case 'SET_QTY':
      return { ...state, items: state.items.map(i => i.productId === action.productId ? { ...i, quantity: Math.max(1, action.quantity) } : i) };
    case 'CLEAR':
      return { items: [], coupon: null };
    case 'REPLACE':
      return action.state;
    case 'APPLY_COUPON':
      return { ...state, coupon: action.coupon };
    case 'REMOVE_COUPON':
      return { ...state, coupon: null };
    case 'SET_CHECKOUT':
      const prev = state.checkout || { name: '', email: '', address: '' };
      return { ...state, checkout: { ...prev, ...action.checkout } };
    default:
      return state;
  }
}

// Pricing helpers
export interface PricingTotals { subtotal: number; discountAmount: number; shippingFee: number; tax: number; total: number; }

export function computeSubtotal(items: CartItem[], products: Product[]): number {
  return items.reduce((sum, it) => {
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

export function computeDiscount(subtotal: number, coupon?: AppliedCoupon | null): number {
  if (!coupon) return 0;
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.kind === 'percent') return Math.floor((subtotal * coupon.value) / 100);
  return Math.min(coupon.value, subtotal);
}

export function computeShipping(subtotal: number, discount: number, baseFee: number): number {
  const after = subtotal - discount;
  if (after <= 0) return 0;
  if (after >= 1_000_000) return 0; // free threshold
  return baseFee;
}

export function computeTotals(state: CartState, products: Product[], options?: { baseShipping?: number; vatEnabled?: boolean; vatRate?: number }): PricingTotals {
  return runPricingPipeline(state, products, { baseShipping: options?.baseShipping, vatEnabled: options?.vatEnabled, vatRate: options?.vatRate });
}
