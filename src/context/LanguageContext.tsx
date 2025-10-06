"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

type Locale = 'vi' | 'en';

interface Dictionary {
  [key: string]: { vi: string; en: string | ((...args: any[]) => string) };
}

const DICT: Dictionary = {
  cart: { vi: 'Giỏ hàng', en: 'Cart' },
  subtotal: { vi: 'Tạm tính', en: 'Subtotal' },
  discount: { vi: 'Giảm giá', en: 'Discount' },
  shipping: { vi: 'Phí ship', en: 'Shipping' },
  free: { vi: 'Miễn phí', en: 'Free' },
  vat: { vi: 'VAT', en: 'VAT' },
  total: { vi: 'Tổng', en: 'Total' },
  coupon: { vi: 'Mã giảm giá', en: 'Coupon' },
  apply: { vi: 'Áp dụng', en: 'Apply' },
  remove: { vi: 'Huỷ', en: 'Remove' },
  checkoutInfo: { vi: 'Thông tin nhận hàng (demo)', en: 'Checkout Information (demo)' },
  name: { vi: 'Họ tên', en: 'Full name' },
  email: { vi: 'Email', en: 'Email' },
  address: { vi: 'Địa chỉ', en: 'Address' },
  province: { vi: 'Tỉnh/Thành', en: 'Province' },
  selectProvince: { vi: '-- Chọn tỉnh/thành --', en: '-- Select province --' },
  payDemo: { vi: 'Thanh toán (demo)', en: 'Pay (demo)' },
  notReady: { vi: 'Điền đủ thông tin để thanh toán', en: 'Fill info to checkout' },
  couponNotQualified: { vi: 'Chưa đạt điều kiện áp dụng', en: 'Not qualified yet' },
  countdownExpire: { vi: 'Hết hạn sau', en: 'Expires in' },
  language: { vi: 'Ngôn ngữ', en: 'Language' }
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof DICT, opts?: any) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'vi',
  setLocale: () => {},
  t: (k: any) => k
});

const LS_KEY = 'lang:v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(LS_KEY) as Locale | null;
    if (saved === 'vi' || saved === 'en') setLocale(saved);
  }, []);
  const change = (l: Locale) => {
    setLocale(l);
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, l);
  };
  const t = useCallback((key: keyof typeof DICT): string => {
    const entry = DICT[key];
    if (!entry) return String(key);
    const val = entry[locale];
    return typeof val === 'function' ? (val as any)() : (val as string);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale: change, t }), [locale, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
