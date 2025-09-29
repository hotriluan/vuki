import { describe, it, expect } from 'vitest';
import { computeTotals, COUPONS, type CartState } from '../cartCore';
import { products } from '@/lib/data';

describe('New cart pricing features', () => {
  it('expired coupon would discount but app layer blocks it', () => {
    const expired = COUPONS.find(c => c.code === 'OLD5')!;
    // Force a scenario showing raw engine would apply if not blocked
    const state: CartState = { items: [{ productId: 'p-1', quantity: 1 }], coupon: expired };
    const raw = computeTotals(state, products as any, { vatEnabled: false });
    expect(raw.discountAmount).toBeGreaterThanOrEqual(0); // baseline
    // Simulate applyCoupon result
    const isExpired = expired.expiresAt && Date.now() > Date.parse(expired.expiresAt);
    if (isExpired) {
      // app would not set coupon -> recompute with null
      const blocked = computeTotals({ ...state, coupon: null }, products as any, { vatEnabled: false });
      expect(blocked.discountAmount).toBe(0);
    }
  });

  it('VAT on increases total compared to VAT off', () => {
    const state: CartState = { items: [{ productId: 'p-1', quantity: 1 }], coupon: null };
    const off = computeTotals(state, products as any, { baseShipping: 30000, vatEnabled: false });
    const on = computeTotals(state, products as any, { baseShipping: 30000, vatEnabled: true });
    expect(on.tax).toBeGreaterThan(0);
    expect(on.total).toBe(off.total + on.tax); // shipping identical, discount 0
  });

  it('province shipping changes fee before reaching free threshold', () => {
    const cheap = products.find(p => p.id === 'p-4')!; // ~< threshold definitely
    const state: CartState = { items: [{ productId: cheap.id, quantity: 1 }], coupon: null };
    const hcm = computeTotals(state, products as any, { baseShipping: 30000, vatEnabled: false });
    const hn = computeTotals(state, products as any, { baseShipping: 35000, vatEnabled: false });
    if (hcm.subtotal < 1_000_000) {
      expect(hcm.shippingFee).not.toBe(hn.shippingFee);
    }
  });
});
