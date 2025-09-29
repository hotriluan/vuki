"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type CurrencyCode = 'VND' | 'USD' | 'EUR';

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountVnd: number) => string; // input luôn base VND
  rates: Record<CurrencyCode, number>; // 1 đơn vị currency = ? VND
  convert: (amountVnd: number, to?: CurrencyCode) => number;
}

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  VND: 1,
  USD: 24000, // 1 USD = 24,000 VND (mock)
  EUR: 26000  // 1 EUR = 26,000 VND (mock)
};

const KEY = 'currency:v1';

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('VND');
  const [rates] = useState(DEFAULT_RATES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed === 'VND' || parsed === 'USD' || parsed === 'EUR')) setCurrencyState(parsed);
      }
    } catch {}
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  };

  function convert(amountVnd: number, to: CurrencyCode = currency) {
    if (to === 'VND') return amountVnd;
    const rate = rates[to];
    if (!rate) return amountVnd;
    return amountVnd / rate;
  }

  const formatters = useMemo(() => ({
    VND: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
  }), []);

  function format(amountVnd: number) {
    const converted = convert(amountVnd);
    const fmt = formatters[currency];
    return fmt.format(converted);
  }

  const value: CurrencyState = {
    currency,
    setCurrency,
    format,
    rates,
    convert
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}