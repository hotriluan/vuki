import { describe, it, expect } from 'vitest';
import { getRelatedProducts } from '../related';
import { products } from '../__legacyTestStubs';

const base = products.find(p => p.id === 'p-1'); // may be undefined in stub

describe('getRelatedProducts', () => {
  it('excludes the base product', async () => {
    const related = await getRelatedProducts(base as any, 4);
    expect(related.find((p: any) => p.id === base?.id)).toBeUndefined();
  });

  it('respects limit parameter', async () => {
    const related = await getRelatedProducts(base as any, 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });
});
