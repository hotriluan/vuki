import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartDrawer } from '../CartDrawer';
import * as data from '@/lib/data';

// Minimal mock products access if needed
const firstTwo = data.products.slice(0,2);

function Wrapper({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider><CartProvider>{children}</CartProvider></CurrencyProvider>;
}

describe('CartDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function openWith(onClose=()=>{}) {
    return render(<CartDrawer open onClose={onClose} />, { wrapper: Wrapper });
  }

  it('renders empty state', () => {
    openWith();
    expect(screen.getByText(/Chưa có sản phẩm nào/i)).toBeInTheDocument();
  });

  it('shows items and updates quantity', () => {
    // Pre-seed cart in localStorage (CartContext will rehydrate)
    const stored = { items: [{ productId: firstTwo[0].id, quantity: 1 }], coupon: null, version: 2 };
    localStorage.setItem('cart:v1', JSON.stringify(stored));
    openWith();
    const qtySpan = screen.getByText('1');
    const increase = screen.getByLabelText('Tăng');
    act(() => { fireEvent.click(increase); });
    expect(qtySpan.textContent).toBe('2');
  });

  it('applies coupon SALE10 and shows discount', async () => {
    // Ensure subtotal > 500_000 (minSubtotal). Using product p-1 salePrice 1_290_000 *1 already satisfies.
    const stored = { items: [{ productId: firstTwo[0].id, quantity: 1 }], coupon: null, version: 2 };
    localStorage.setItem('cart:v1', JSON.stringify(stored));
    openWith();
    const input = screen.getByPlaceholderText('Mã');
    const form = input.closest('form')!;
    act(() => {
      fireEvent.change(input, { target: { value: 'SALE10' } });
      fireEvent.submit(form);
    });
    // coupon badge appears asynchronously after state update
    expect(await screen.findByText(/SALE10/i)).toBeInTheDocument();
    // discount line
    expect(screen.getByText(/Giảm/i)).toBeInTheDocument();
  });

  it('removes item', () => {
    const stored = { items: [{ productId: firstTwo[1].id, quantity: 1 }], coupon: null, version: 2 };
    localStorage.setItem('cart:v1', JSON.stringify(stored));
    openWith();
    act(() => { fireEvent.click(screen.getByLabelText('Xoá sản phẩm')); });
    expect(screen.getByText(/Chưa có sản phẩm/i)).toBeInTheDocument();
  });
});
