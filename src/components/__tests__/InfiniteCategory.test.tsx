import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InfiniteCategory } from '../InfiniteCategory';
import * as data from '@/lib/data';

// Mock ProductCard to simplify output and count renders
vi.mock('../ProductCard', () => ({
  ProductCard: ({ product }: any) => <div data-testid="product" data-id={product.id}>{product.name}</div>
}));

// Provide deterministic dataset by mocking lib/data if needed
// but we rely on actual products list (assumed present). If missing we could mock here.

describe('InfiniteCategory', () => {
  const slug = 'sneakers'; // we will mock dataset for this slug
  const fakeProducts = Array.from({ length: 10 }).map((_, i) => ({
    id: `mock-${i}`,
    name: `Mock Product ${i}`,
    slug: `mock-product-${i}`,
    description: 'desc',
    price: 1000 + i,
    categoryIds: ['c-sneakers'],
    images: ['https://example.com/x.jpg'],
    createdAt: new Date().toISOString()
  }));

  beforeEach(() => {
    // mock productsByCategorySlug so we fully control length
    vi.spyOn(data, 'productsByCategorySlug').mockImplementation((s: string) => {
      return s === slug ? fakeProducts : [];
    });
    // Mock IntersectionObserver
    let lastInstance: any;
    (global as any).IntersectionObserver = class {
      cb: any;
      constructor(cb: any) { this.cb = cb; lastInstance = this; }
      observe() { /* no-op until we trigger manually */ }
      disconnect() {}
      static get _last() { return lastInstance; }
    };
  });

  it('renders first page and auto loads more when observer triggers', () => {
    const { rerender } = render(<InfiniteCategory slug={slug} pageSize={4} />);
    expect(screen.getAllByTestId('product').length).toBe(4);
    const instance = (global as any).IntersectionObserver._last;
    // first intersection loads second page (8 items)
    act(() => { instance.cb([{ isIntersecting: true }]); });
    expect(screen.getAllByTestId('product').length).toBe(8);
    // second intersection loads remaining (10 items total) and then stops
    act(() => { instance.cb([{ isIntersecting: true }]); });
    expect(screen.getAllByTestId('product').length).toBe(10);
  });

  it('manual load via button', () => {
    render(<InfiniteCategory slug={slug} pageSize={3} />);
    const loadBtn = screen.getByRole('button', { name: /Tải thêm/i });
    expect(screen.getAllByTestId('product').length).toBe(3);
    fireEvent.click(loadBtn);
    expect(screen.getAllByTestId('product').length).toBe(6);
  });

  it('toggle auto mode', () => {
    render(<InfiniteCategory slug={slug} pageSize={3} />);
    const toggle = screen.getByRole('button', { name: /Chế độ:/i });
    const before = toggle.textContent;
    fireEvent.click(toggle);
    expect(toggle.textContent).not.toBe(before);
  });
});
