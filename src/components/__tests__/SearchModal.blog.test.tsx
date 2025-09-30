import React from 'react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchModal } from '../SearchModal';
import * as searchLib from '@/lib/search';

// Mock fetch index unified (product + blog). We'll just provide one blog item containing a unique token.
beforeAll(() => {
  (globalThis as any).fetch = vi.fn(async (url: string) => {
    if (url === '/search-index.json') {
      return { json: async () => [
        { id: 'p-1', type: 'product', slug: 'urban-runner-white', name: 'Urban Runner White', description: 'Lightweight everyday sneaker' },
        { id: 'blog:bao-quan-giay-sneaker', type: 'blog', slug: 'bao-quan-giay-sneaker', name: 'Bảo quản sneaker đúng cách', description: 'Humidity UV và bụi bẩn là kẻ thù lớn' }
      ] } as any;
    }
    throw new Error('Unexpected fetch ' + url);
  });
});


describe('SearchModal unified blog search', () => {
  it('returns blog result when query matches only blog description token', async () => {
    // Spy real searchProducts but let it execute (we don't mock implementation)
    // Instead we rely on underlying fuse after index load.
    const spy = vi.spyOn(searchLib, 'searchProducts');
    await act(async () => { render(<SearchModal open={true} onClose={() => {}} debounceMs={0} />); });
  const input = screen.getByLabelText(/Search products and blog/i);
    await act(async () => { fireEvent.change(input, { target: { value: 'Humidity' } }); });
    const options = await screen.findAllByRole('option');
  expect(options.length).toBe(1);
  const link = options[0].closest('a');
  expect(link).toBeTruthy();
  expect(link?.getAttribute('href')).toBe('/blog/bao-quan-giay-sneaker');
  // Badge text
  expect(options[0].textContent).toMatch(/Bài viết/i);
  });
});
