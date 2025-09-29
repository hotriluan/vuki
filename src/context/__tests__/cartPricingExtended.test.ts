import { describe, it, expect } from 'vitest';
import { computeTotals, COUPONS, type CartState } from '../cartCore';
import { products } from '@/lib/data';

// Helper to find product with variants
const productWithVariants = products.find(p => p.variants && p.variants.length > 0)!;

describe('Extended pricing cases', () => {
  it('coupon rejected when subtotal < minSubtotal', () => {
    const sale10 = COUPONS.find(c => c.code === 'SALE10')!; // minSubtotal 500k
    // pick cheap product (p-4 price 99k or sale 79k)
    const cheap = products.find(p => p.id === 'p-4')!;
    const state: CartState = { items: [{ productId: cheap.id, quantity: 1 }], coupon: sale10 };
    const totals = computeTotals(state, products as any);
    // discountAmount must be 0 because fails minSubtotal
    expect(totals.discountAmount).toBe(0);
    expect(totals.subtotal).toBeGreaterThan(0);
  });

  it('variant priceDiff increases subtotal correctly', () => {
    // choose variant with priceDiff (sz-41 has priceDiff 20_000 in dataset)
    const variant = productWithVariants.variants!.find(v => typeof v.priceDiff === 'number');
    expect(variant).toBeTruthy();
    const base = productWithVariants.salePrice && productWithVariants.salePrice < productWithVariants.price
      ? productWithVariants.salePrice
      : productWithVariants.price;
    const expectedUnit = base + (variant?.priceDiff || 0);
    const state: CartState = { items: [{ productId: productWithVariants.id, quantity: 2, variantId: variant!.id }], coupon: null };
    const totals = computeTotals(state, products as any);
    expect(totals.subtotal).toBe(expectedUnit * 2);
  });
});