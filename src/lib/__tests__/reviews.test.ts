import { describe, it, expect } from 'vitest';
import { getReviewsByProduct, getAggregatedRating } from '../reviews';

describe('reviews utilities', () => {
  it('returns reviews sorted newest first', () => {
    const list = getReviewsByProduct('p-1');
    const dates = list.map(r => r.createdAt);
    const sorted = [...dates].sort((a,b)=> b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it('computes correct aggregate rating', () => {
    const agg = getAggregatedRating('p-1');
    expect(agg).not.toBeNull();
    if (agg) {
      // ratings for p-1 in mock: 5,4,3 => average 4.0 count 3
      expect(agg.count).toBe(3);
      expect(Number(agg.average.toFixed(2))).toBe(4.00);
    }
  });

  it('returns null aggregate when no reviews', () => {
    const agg = getAggregatedRating('p-2'); // no reviews defined
    expect(agg).toBeNull();
  });
});
