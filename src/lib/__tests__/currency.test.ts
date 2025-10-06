import { formatVnd, makeFormatter } from '@/lib/currency';

describe('Currency Utils', () => {
  test('formatVnd should format VND correctly', () => {
    expect(formatVnd(100000)).toContain('100.000');
    expect(formatVnd(100000)).toContain('₫');
    expect(formatVnd(1000)).toContain('1.000');
    expect(formatVnd(0)).toContain('0');
  });

  test('makeFormatter should create formatter function', () => {
    const formatUsd = makeFormatter('en-US', 'USD');
    expect(formatUsd(100)).toBe('$100');
    expect(formatUsd(1000)).toBe('$1,000');
  });

  test('makeFormatter should handle different locales', () => {
    const formatEur = makeFormatter('de-DE', 'EUR');
    expect(formatEur(100)).toContain('€');
    expect(formatEur(1000)).toContain('1.000');
  });
});