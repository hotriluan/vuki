import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '@/app/cart/page';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider><CurrencyProvider><CartProvider>{children}</CartProvider></CurrencyProvider></LanguageProvider>;
}

describe('Cart i18n + auto province + countdown', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('language toggle switches labels', () => {
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-1', quantity: 1 }], version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
    expect(screen.getByText(/Giỏ hàng/i)).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('VI'), { target: { value: 'en' } });
    expect(screen.getByText(/Cart/i)).toBeInTheDocument();
  });

  it('auto detects province from address blur', () => {
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-1', quantity: 1 }], version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
    const address = screen.getByPlaceholderText(/Địa chỉ|Address/);
    fireEvent.change(address, { target: { value: '123 ABC, Quan 1, Ho Chi Minh' } });
    fireEvent.blur(address);
    const select = screen.getByDisplayValue(/-- Chọn tỉnh|-- Select province|TP Hồ Chí Minh/);
    // After blur province should be auto-set to TP Hồ Chí Minh
    expect(screen.getByDisplayValue('TP Hồ Chí Minh')).toBeInTheDocument();
  });

  it('shows coupon countdown when within 24h', () => {
    // Create a coupon expiring soon (manually place in storage)
    const soon = new Date(Date.now() + 10_000).toISOString();
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-1', quantity: 1 }], coupon: { code: 'SALE10', kind: 'percent', value: 10, expiresAt: soon }, version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
    // Should render countdown label (vi or en depending default)
    expect(screen.getByText(/Hết hạn sau|Expires in/)).toBeInTheDocument();
  });
});
