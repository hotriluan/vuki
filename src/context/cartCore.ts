import type { Product } from '@/lib/types';

export interface CartItem { productId: string; quantity: number; variantId?: string | null; }
export interface AppliedCoupon { code: string; kind: 'percent' | 'fixed'; value: number; minSubtotal?: number; }
export interface CartState { items: CartItem[]; coupon?: AppliedCoupon | null; }

export const COUPONS: AppliedCoupon[] = [
  { code: 'SALE10', kind: 'percent', value: 10, minSubtotal: 500_000 },
  { code: 'FREESHIP', kind: 'fixed', value: 30_000, minSubtotal: 300_000 },
  { code: 'VIP50K', kind: 'fixed', value: 50_000, minSubtotal: 800_000 }
];

export type Action =
  | { type: 'ADD'; productId: string; quantity?: number; variantId?: string | null }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'REPLACE'; state: CartState }
  | { type: 'APPLY_COUPON'; coupon: AppliedCoupon | null }
  | { type: 'REMOVE_COUPON' };

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
    default:
      return state;
  }
}

// Pricing helpers
export interface PricingTotals { subtotal: number; discountAmount: number; shippingFee: number; total: number; }

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

export function computeShipping(subtotal: number, discount: number): number {
  const after = subtotal - discount;
  if (after <= 0) return 0;
  return after >= 1_000_000 ? 0 : 30_000;
}

export function computeTotals(state: CartState, products: Product[]): PricingTotals {
  const subtotal = computeSubtotal(state.items, products);
  const discountAmount = computeDiscount(subtotal, state.coupon);
  const shippingFee = computeShipping(subtotal, discountAmount);
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  return { subtotal, discountAmount, shippingFee, total };
}
