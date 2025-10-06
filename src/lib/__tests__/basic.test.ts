import { describe, it, expect } from 'vitest';
import { mockProducts, mockCategories } from './mockData';

describe('Basic Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    expect('vuki'.toUpperCase()).toBe('VUKI');
  });

  it('should have mock data available', () => {
    expect(mockProducts).toHaveLength(4);
    expect(mockCategories).toHaveLength(4);
    expect(mockProducts[0].id).toBe('p-1');
  });
});