import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext';
import { Price } from '../Price';

function renderWithCurrency(ui: React.ReactNode) {
  return render(<CurrencyProvider>{ui}</CurrencyProvider>);
}

describe('Price component', () => {
  it('renders base price when no valid sale', () => {
    renderWithCurrency(<Price price={150000} />);
    const el = screen.getByText(/150|150\.000|150,000/); // tolerate format differences if locale changes
    expect(el).toBeInTheDocument();
    expect(screen.queryByText(/-%/)).toBeNull();
  });

  it('renders sale price, strikes original and shows percent', () => {
    renderWithCurrency(<Price price={200000} salePrice={150000} />);
    const sale = screen.getByText(/150|150\.000|150,000/);
    const original = screen.getByText(/200|200\.000|200,000/);
    expect(sale).toBeInTheDocument();
    expect(original).toHaveClass('line-through');
    const discount = screen.getByText(/-25%/);
    expect(discount).toBeInTheDocument();
  });

  it('reacts to currency changes (USD)', () => {
    function Test() {
      const { setCurrency } = useCurrency();
      return (
        <div>
          <button onClick={() => setCurrency('USD')}>USD</button>
          <Price price={24000} />
        </div>
      );
    }
    render(<CurrencyProvider><Test /></CurrencyProvider>);
    // Initially VND formatted (may contain ₫)
    expect(screen.getByText(/24[,\.]*000/)).toBeInTheDocument();
    act(() => { screen.getByText('USD').click(); });
    // After switch should show roughly $1.00 (allow $1 or $1.00 depending formatting)
    expect(screen.getByText(/\$?1(\.00)?/)).toBeInTheDocument();
  });
});
