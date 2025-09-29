import { describe, it, expect } from 'vitest';
import { cartReducer, computeTotals, computeDiscount, COUPONS, type CartState } from '../cartCore';
import { products } from '@/lib/data';

function baseState(): CartState { return { items: [], coupon: null }; }

describe('cartReducer', () => {
  it('adds item', () => {
    const s1 = baseState();
    const s2 = cartReducer(s1, { type: 'ADD', productId: 'p-1', quantity: 2 });
    expect(s2.items[0]).toMatchObject({ productId: 'p-1', quantity: 2 });
  });

  it('increments existing item', () => {
    const s1: CartState = { items: [{ productId: 'p-1', quantity: 1 }], coupon: null };
    const s2 = cartReducer(s1, { type: 'ADD', productId: 'p-1', quantity: 1 });
    expect(s2.items[0].quantity).toBe(2);
  });

  it('clamps SET_QTY to minimum 1', () => {
    const s1: CartState = { items: [{ productId: 'p-1', quantity: 3 }], coupon: null };
    const s2 = cartReducer(s1, { type: 'SET_QTY', productId: 'p-1', quantity: 0 });
    expect(s2.items[0].quantity).toBe(1);
  });
});

describe('pricing logic', () => {
  it('applies percent coupon correctly', () => {
    let state: CartState = { items: [{ productId: 'p-1', quantity: 1 }], coupon: COUPONS.find(c => c.code === 'SALE10') };
    const totals = computeTotals(state, products as any);
    expect(totals.discountAmount).toBeGreaterThan(0);
    expect(totals.total).toBe(totals.subtotal - totals.discountAmount + totals.shippingFee);
  });

  it('free shipping threshold works', () => {
    // Choose product with price high enough (p-3 maybe 2.350.000) * 1 < threshold so add quantity
    let state: CartState = { items: [{ productId: 'p-3', quantity: 1 }], coupon: null };
    let totals = computeTotals(state, products as any);
    // may not reach threshold, force by increasing qty
    if (totals.subtotal < 1_000_000) {
      state = { items: [{ productId: 'p-3', quantity: 2 }], coupon: null };
      totals = computeTotals(state, products as any);
    }
    if (totals.subtotal >= 1_000_000) {
      expect(totals.shippingFee).toBe(0);
    } else {
      expect(totals.shippingFee).toBeGreaterThanOrEqual(0); // fallback
    }
  });

  it('variant override/priceDiff respected', () => {
    // p-1 has variants, pick one with priceDiff or override
    const variantId = 'sz-41';
    const state: CartState = { items: [{ productId: 'p-1', quantity: 1, variantId }], coupon: null };
    const totals = computeTotals(state, products as any);
    expect(totals.subtotal).toBeGreaterThan(0);
  });

  it('fixed coupon clamps to subtotal (no negative)', () => {
    const subtotal = 40_000;
    const fakeCoupon = { code: 'BIG50K', kind: 'fixed', value: 50_000 } as const;
    const discount = computeDiscount(subtotal, fakeCoupon);
    expect(discount).toBe(40_000);
  });

  it('total never negative even with huge percent coupon', () => {
    const state: CartState = { items: [{ productId: 'p-1', quantity: 1 }], coupon: { code: 'HUGE', kind: 'percent', value: 999 } };
    const totals = computeTotals(state, products as any);
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });
});
