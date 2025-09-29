import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { LanguageProvider } from '@/context/LanguageContext';
import CartPage from '@/app/cart/page';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider><CurrencyProvider><CartProvider>{children}</CartProvider></CurrencyProvider></LanguageProvider>;
}

describe('Cart enhancements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('disables checkout until form valid', () => {
    // Seed one item so only form blocks
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-1', quantity: 1 }], version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
  const payBtn = screen.getByRole('button', { name: /(Thanh toán \(demo\)|Pay Now|Checkout)/i });
    expect(payBtn).toBeDisabled();
  fireEvent.change(screen.getByPlaceholderText(/(Họ tên|name)/i), { target: { value: 'An' } });
  fireEvent.change(screen.getByPlaceholderText(/(Email|email)/i), { target: { value: 'an@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/(Địa chỉ|address)/i), { target: { value: '123 Đường ABC' } });
  // Province select has name="province"; select from all comboboxes
  const comboBoxes = screen.queryAllByRole('combobox');
  const provinceEl = comboBoxes.find(el => (el as HTMLSelectElement).name === 'province') as HTMLSelectElement;
  fireEvent.change(provinceEl, { target: { value: 'TP Hồ Chí Minh' } });
    expect(payBtn).not.toBeDisabled();
  });

  it('VAT toggle changes total', () => {
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-1', quantity: 1 }], version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
  const totalBefore = screen.getByTestId('cart-total').textContent;
    const vatToggle = screen.getByLabelText(/VAT 10%/);
  fireEvent.click(vatToggle); // toggle off
  const totalAfter = screen.getByTestId('cart-total').textContent;
    expect(totalBefore).not.toBe(totalAfter);
  });

  it('shows inline coupon error', () => {
    localStorage.setItem('cart:v1', JSON.stringify({ items: [{ productId: 'p-4', quantity: 1 }], version: 4 }));
    render(<CartPage />, { wrapper: Wrapper });
  const input = screen.getByPlaceholderText(/(Mã giảm giá|coupon)/i);
    const form = input.closest('form')!;
    fireEvent.change(input, { target: { value: 'UNKNOWN' } });
    fireEvent.submit(form);
    expect(screen.getByText(/Mã không hợp lệ|Không áp dụng được/i)).toBeInTheDocument();
  });
});
