import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PricingBreakdown } from '../PricingBreakdown';

describe('PricingBreakdown', () => {
  it('renders values & hides discount when zero', () => {
    render(<PricingBreakdown subtotal={1000} discountAmount={0} shippingFee={0} tax={0} total={1000} format={v => v.toString()} />);
    expect(screen.getByTestId('cart-total').textContent).toBe('1000');
    expect(screen.queryByText(/-100/)).not.toBeInTheDocument();
  });
});
