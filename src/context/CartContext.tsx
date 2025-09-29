"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useCallback } from 'react';
import { products } from '@/lib/data';
import { Product } from '@/lib/types';
import { cartReducer, COUPONS, type CartState, type AppliedCoupon, type CartItem } from './cartCore';
import { computeTotals } from './cartCore';

const CartContext = createContext<{
  state: CartState;
  add: (product: Product, qty?: number, variantId?: string | null) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => { ok: boolean; reason?: string };
  removeCoupon: () => void;
  totalItems: number;
  shippingFee: number;
  discountAmount: number;
  subtotal: number;
  total: number;
}>({
  state: { items: [] },
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
  applyCoupon: () => ({ ok: false }),
  removeCoupon: () => {},
  totalItems: 0,
  shippingFee: 0,
  discountAmount: 0,
  subtotal: 0,
  total: 0
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null });
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
      const parsed = JSON.parse(raw) as { items?: CartItem[]; version?: number; coupon?: AppliedCoupon | null };
      if (Array.isArray(parsed.items)) {
        dispatch({ type: 'REPLACE', state: { items: parsed.items, coupon: parsed.coupon ?? null } });
      }
    } catch {}
  }, []);

  // Persist whenever items change (after hydration pass)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return; // skip initial render before hydration attempt
    try {
      window.localStorage.setItem(HYDRATED_KEY, JSON.stringify({ items: state.items, coupon: state.coupon, version: 2 }));
    } catch {}
  }, [state.items, state.coupon]);

  const totalItems = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);

  // Compute totals directly from statically imported products (avoids dynamic require incompatibility under ESM)
  const { subtotal, discountAmount, shippingFee, total } = useMemo(() => computeTotals(state, products), [state]);

  const applyCoupon = useCallback((code: string) => {
    const upper = code.trim().toUpperCase();
    const found = COUPONS.find(c => c.code === upper);
    if (!found) return { ok: false, reason: 'Mã không hợp lệ' };
    if (found.minSubtotal && subtotal < found.minSubtotal) return { ok: false, reason: 'Chưa đạt điều kiện' };
    dispatch({ type: 'APPLY_COUPON', coupon: found });
    return { ok: true };
  }, [subtotal]);
  const removeCoupon = useCallback(() => { dispatch({ type: 'REMOVE_COUPON' }); }, []);

  const value = useMemo(
    () => ({
      state,
      add: (product: Product, qty = 1, variantId?: string | null) => dispatch({ type: 'ADD', productId: product.id, quantity: qty, variantId }),
      remove: (productId: string) => dispatch({ type: 'REMOVE', productId }),
      setQty: (productId: string, quantity: number) => dispatch({ type: 'SET_QTY', productId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      applyCoupon,
      removeCoupon,
      totalItems,
      shippingFee,
      discountAmount,
      subtotal,
      total
    }),
    [state, totalItems, shippingFee, discountAmount, subtotal, total, applyCoupon, removeCoupon]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
