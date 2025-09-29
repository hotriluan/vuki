"use client";
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(() => import('./SearchModal').then(m => m.SearchModal), { ssr: false, loading: () => null });
import { useCurrency } from '@/context/CurrencyContext';

const CartDrawer = dynamic(() => import('./cart/CartDrawer').then(m => m.CartDrawer), { ssr: false });

export function Header() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcuts: / to open (unless in input/textarea), Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && !searchOpen) {
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
        e.preventDefault();
        setSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);
  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
          <Link href="/" className="font-bold text-xl">Brand</Link>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/category/sneakers" className="hover:text-brand-accent">Sneakers</Link>
            <Link href="/category/boots" className="hover:text-brand-accent">Boots</Link>
            <Link href="/category/accessories" className="hover:text-brand-accent">Accessories</Link>
            <Link href="/category/limited" className="hover:text-brand-accent">Limited</Link>
          </nav>
          <div className="flex items-center gap-4">
            <select
              aria-label="Currency"
              className="text-xs border rounded px-1 py-0.5 bg-white"
              value={currency}
              onChange={e => setCurrency(e.target.value as any)}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <button aria-label="Search" className="text-sm" onClick={() => setSearchOpen(true)}>Search</button>
            <Link href="/wishlist" aria-label="Wishlist" className="relative text-sm">
              <span>❤</span>
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-brand-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button onClick={openDrawer} aria-label="Cart" className="relative text-sm font-medium">
              <span>Cart ({totalItems})</span>
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={open} onClose={closeDrawer} />
  <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
