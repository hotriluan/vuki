"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useCallback, useState } from 'react';
import { products } from '@/lib/data';
import { Product } from '@/lib/types';
import { cartReducer, COUPONS, type CartState, type AppliedCoupon, type CartItem } from './cartCore';
import { computeTotals } from './cartCore';
import { getProvinceShippingBase } from '@/config/shipping';
import { VAT_ENABLED, VAT_RATE } from '@/config/pricing';

const CartContext = createContext<{
  state: CartState;
  add: (product: Product, qty?: number, variantId?: string | null) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => { ok: boolean; reason?: string };
  removeCoupon: () => void;
  setCheckout: (data: Partial<{ name: string; email: string; address: string }>) => void;
  setVatEnabled: (on: boolean) => void;
  totalItems: number;
  shippingFee: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  tax: number;
  vatEnabled: boolean;
  isCheckoutReady: boolean;
}>({
  state: { items: [] },
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
  applyCoupon: () => ({ ok: false }),
  removeCoupon: () => {},
  setCheckout: () => {},
  setVatEnabled: () => {},
  totalItems: 0,
  shippingFee: 0,
  discountAmount: 0,
  subtotal: 0,
  total: 0,
  tax: 0,
  vatEnabled: true,
  isCheckoutReady: false
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null, checkout: { name: '', email: '', address: '', province: '' } });
  const [vatEnabledState, setVatEnabled] = useState<boolean>(VAT_ENABLED);
  const HYDRATED_KEY = 'cart:v1';
  const hydratedRef = useRef(false);

  // Hydrate from localStorage once (client only)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(HYDRATED_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: CartItem[]; version?: number; coupon?: AppliedCoupon | null; checkout?: { name?: string; email?: string; address?: string; province?: string }; vatEnabled?: boolean };
      if (Array.isArray(parsed.items)) {
        dispatch({ type: 'REPLACE', state: { items: parsed.items, coupon: parsed.coupon ?? null, checkout: { name: parsed.checkout?.name || '', email: parsed.checkout?.email || '', address: parsed.checkout?.address || '', province: parsed.checkout?.province || '' } } });
        if (typeof parsed.vatEnabled === 'boolean') setVatEnabled(parsed.vatEnabled);
      }
    } catch {}
  }, []);

  // Persist items/coupon/vat (immediate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return;
    try {
      const raw = window.localStorage.getItem(HYDRATED_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(HYDRATED_KEY, JSON.stringify({
        ...prev,
        items: state.items,
        coupon: state.coupon,
        vatEnabled: vatEnabledState,
        version: 4,
        checkout: state.checkout // may be slightly stale relative to debounced write, but updated fully below
      }));
    } catch {}
  }, [state.items, state.coupon, vatEnabledState]);

  // Debounced checkout persistence (300ms after last change)
  const checkoutRef = useRef(state.checkout);
  checkoutRef.current = state.checkout;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return;
    const id = setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(HYDRATED_KEY);
        const prev = raw ? JSON.parse(raw) : {};
        window.localStorage.setItem(HYDRATED_KEY, JSON.stringify({
          ...prev,
            checkout: checkoutRef.current,
            version: 4
        }));
      } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [state.checkout]);

  const totalItems = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);

  // Compute totals directly from statically imported products (avoids dynamic require incompatibility under ESM)
  const { subtotal, discountAmount, shippingFee, tax, total } = useMemo(() => {
    const province = state.checkout?.province;
    const base = getProvinceShippingBase(province);
    return computeTotals(state, products, { baseShipping: base, vatEnabled: vatEnabledState, vatRate: VAT_RATE });
  }, [state, vatEnabledState]);

  const applyCoupon = useCallback((code: string) => {
    const upper = code.trim().toUpperCase();
    const found = COUPONS.find(c => c.code === upper);
    if (!found) return { ok: false, reason: 'Mã không hợp lệ' };
    if (state.coupon && state.coupon.code !== upper) return { ok: false, reason: 'Đã có coupon khác' };
    if (found.expiresAt && Date.now() > Date.parse(found.expiresAt)) return { ok: false, reason: 'Mã đã hết hạn' };
    if (found.minSubtotal && subtotal < found.minSubtotal) return { ok: false, reason: 'Chưa đạt điều kiện' };
    dispatch({ type: 'APPLY_COUPON', coupon: found });
    return { ok: true };
  }, [subtotal, state.coupon]);
  const removeCoupon = useCallback(() => { dispatch({ type: 'REMOVE_COUPON' }); }, []);

  const isCheckoutReady = useMemo(() => {
    const c = state.checkout || { name: '', email: '', address: '', province: '' } as any;
    if (!c.name || c.name.trim().length < 2) return false;
    if (!c.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return false;
    if (!c.address || c.address.trim().length < 8) return false;
    if (!c.province) return false;
    return state.items.length > 0;
  }, [state.checkout, state.items.length]);

  const setCheckout = useCallback((data: Partial<{ name: string; email: string; address: string }>) => {
    dispatch({ type: 'SET_CHECKOUT', checkout: data });
  }, []);

  const value = useMemo(
    () => ({
      state,
      add: (product: Product, qty = 1, variantId?: string | null) => dispatch({ type: 'ADD', productId: product.id, quantity: qty, variantId }),
      remove: (productId: string) => dispatch({ type: 'REMOVE', productId }),
      setQty: (productId: string, quantity: number) => dispatch({ type: 'SET_QTY', productId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      applyCoupon,
      removeCoupon,
      setCheckout,
      setVatEnabled: (on: boolean) => setVatEnabled(on),
      totalItems,
      shippingFee,
      discountAmount,
      subtotal,
      total,
      tax,
      vatEnabled: vatEnabledState,
      isCheckoutReady
    }),
    [state, totalItems, shippingFee, discountAmount, subtotal, total, tax, vatEnabledState, isCheckoutReady, applyCoupon, removeCoupon, setCheckout]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
