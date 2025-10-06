import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductReviews } from '@/components/ProductReviews';

describe('ProductReviews', () => {
  it('renders aggregate rating and limited reviews', () => {
    render(<ProductReviews productId="p-1" initialLimit={2} />);
    // Aggregate header
    expect(screen.getByText(/Đánh giá/)).toBeInTheDocument();
    // Should show at most 2 reviews initially
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeLessThanOrEqual(2);
    // Show more button visible because more than 2 reviews exist
    expect(screen.getByRole('button', { name: /Xem thêm/i })).toBeInTheDocument();
  });

  it('expands when clicking Xem thêm', () => {
    render(<ProductReviews productId="p-1" initialLimit={1} />);
    expect(screen.getAllByRole('listitem').length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: /Xem thêm/i }));
    // After expand should have >=2 items (since p-1 has 3 reviews mock)
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
  });

  it('allows submitting a new review and increments count', () => {
    render(<ProductReviews productId="p-1" initialLimit={2} />);
    const heading = screen.getByText(/Đánh giá/);
    const initialCountMatch = heading.textContent?.match(/\((\d+)\)/);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1],10) : 0;
    fireEvent.click(screen.getByRole('button', { name: /Viết đánh giá/i }));
    fireEvent.change(screen.getByPlaceholderText(/Tên của bạn/i), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByPlaceholderText(/Chia sẻ trải nghiệm/i), { target: { value: 'Rất ổn và đáng mua!' } });
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }));
    // Heading should reflect incremented count
    const updated = screen.getByText(/Đánh giá/);
    const m = updated.textContent?.match(/\((\d+)\)/);
    const updatedCount = m ? parseInt(m[1],10) : 0;
    expect(updatedCount).toBe(initialCount + 1);
    // New author name should appear
    expect(screen.getByText('Tester')).toBeInTheDocument();
  });
});
