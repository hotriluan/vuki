"use client";
import { createContext, useContext, useEffect, useReducer, ReactNode, useMemo } from 'react';

interface WishlistState {
  items: string[]; // productIds
  version: number;
}

const WISHLIST_KEY = 'wishlist:v1';
const VERSION = 1;

interface WishlistContextValue {
  items: string[];
  has: (productId: string) => boolean;
  count: number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  clear: () => void;
}

type Action =
  | { type: 'ADD'; productId: string }
  | { type: 'REMOVE'; productId: string }
  | { type: 'TOGGLE'; productId: string }
  | { type: 'CLEAR' }
  | { type: 'REPLACE'; state: WishlistState };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case 'ADD': {
      if (state.items.includes(action.productId)) return state;
      return { ...state, items: [...state.items, action.productId] };
    }
    case 'REMOVE': {
      return { ...state, items: state.items.filter(id => id !== action.productId) };
    }
    case 'TOGGLE': {
      return state.items.includes(action.productId)
        ? { ...state, items: state.items.filter(id => id !== action.productId) }
        : { ...state, items: [...state.items, action.productId] };
    }
    case 'CLEAR': {
      return { ...state, items: [] };
    }
    case 'REPLACE': {
      return action.state;
    }
    default:
      return state;
  }
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], version: VERSION });

  // Rehydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        dispatch({ type: 'REPLACE', state: { items: parsed.items, version: VERSION } });
      }
    } catch (e) {
      console.warn('Wishlist load error', e);
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      const data: WishlistState = { items: state.items, version: VERSION };
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Wishlist save error', e);
    }
  }, [state.items]);

  const value: WishlistContextValue = useMemo(() => ({
    items: state.items,
    has: (productId: string) => state.items.includes(productId),
    count: state.items.length,
    add: (productId: string) => dispatch({ type: 'ADD', productId }),
    remove: (productId: string) => dispatch({ type: 'REMOVE', productId }),
    toggle: (productId: string) => dispatch({ type: 'TOGGLE', productId }),
    clear: () => dispatch({ type: 'CLEAR' })
  }), [state.items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
