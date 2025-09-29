import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { Footer } from '../Footer';

function shell(ui: React.ReactElement) {
  return render(
    <LanguageProvider>
      <CurrencyProvider>
        <CartProvider>
          {ui}
        </CartProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

describe('Layout/Footer smoke', () => {
  it('renders Footer without crashing', () => {
    const { getAllByText } = shell(<Footer />);
    const matches = getAllByText(/Brand|All rights reserved/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
