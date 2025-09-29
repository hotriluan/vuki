import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from '../CurrencyContext';

function setup() {
  return renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
}

describe('CurrencyContext', () => {
  it('defaults to VND and formats without decimals', () => {
    const { result } = setup();
    const formatted = result.current.format(1234567); // 1,234,567 VND
    // Expect no decimal fraction and currency symbol
    expect(formatted).toMatch(/₫|VND/);
    expect(formatted).not.toMatch(/\.\d{2}$/);
  });

  it('converts and formats USD with 2 decimals', () => {
    const { result } = setup();
    act(() => result.current.setCurrency('USD'));
    const converted = result.current.convert(24000); // 1 USD
    expect(converted).toBeCloseTo(1, 5);
    const formatted = result.current.format(24000);
    expect(formatted).toMatch(/\$?1(\.00)?/); // $1.00 or 1.00 depending locale symbol position
  });

  it('converts and formats EUR with 2 decimals (German locale style)', () => {
    const { result } = setup();
    act(() => result.current.setCurrency('EUR'));
    const converted = result.current.convert(52000); // 2 EUR
    expect(converted).toBeCloseTo(2, 5);
    const formatted = result.current.format(52000);
    // de-DE style usually: 2,00 €
    expect(formatted.replace(/\s+/g,' ')).toMatch(/2[,\.]00/);
  });

  it('falls back to raw amount if convert called with unsupported currency', () => {
    const { result } = setup();
    // @ts-ignore forcing an unsupported code to exercise fallback path
    const unchanged = result.current.convert(100000, 'GBP');
    expect(unchanged).toBe(100000);
  });
});
