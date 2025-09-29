"use client";
import { useWishlist } from '@/context/WishlistContext';
import { ComponentProps } from 'react';

interface WishlistButtonProps extends Omit<ComponentProps<'button'>, 'onClick'> {
  productId: string;
  variant?: 'card' | 'detail';
  className?: string;
}

export function WishlistButton({ productId, variant = 'card', className = '', ...rest }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const wished = has(productId);
  const base = variant === 'card'
    ? 'absolute bottom-2 right-2 rounded-full border px-2 py-1 text-[11px] font-medium shadow'
    : 'absolute right-3 top-3 rounded-full border px-3 py-1 text-sm font-medium shadow';
  const active = wished ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white/90 hover:bg-white';
  return (
    <button
      {...rest}
      onClick={() => toggle(productId)}
      aria-pressed={wished}
      aria-label={wished ? 'Bỏ khỏi wishlist' : 'Thêm vào wishlist'}
      className={`${base} ${active} transition ${className}`}
    >{wished ? '♥' : '♡'}</button>
  );
}
