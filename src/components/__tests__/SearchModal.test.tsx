import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchModal } from '../SearchModal';
import * as searchLib from '@/lib/search';

// Minimal mock product result set
const mockResults = [
  {
    product: { slug: 'urban-runner-white', name: 'Urban Runner White', description: 'Lightweight everyday sneaker', id: 'p-1' },
    highlights: [
      { key: 'name', indices: [[0, 4]] }, // "Urban" highlight
      { key: 'description', indices: [[0, 9]] }
    ]
  },
  {
    product: { slug: 'street-pro-black', name: 'Street Pro Black', description: 'Cushioned black runner shoe', id: 'p-2' },
    highlights: [ { key: 'name', indices: [[0, 5]] } ]
  }
] as any;

// Spy searchProducts to return deterministic results
vi.spyOn(searchLib, 'searchProducts').mockImplementation(async (q: string) => {
  if (!q || q.length < 2) return [] as any;
  return mockResults;
});

function renderModal(open = true, onClose = vi.fn()) {
  return render(<SearchModal open={open} onClose={onClose} />);
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('SearchModal', () => {
  it('shows helper message when query < 2 chars', () => {
    renderModal(true);
    expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument();
  });

  it('performs search and renders results with highlight marks', async () => {
    renderModal(true);
    const input = screen.getByLabelText(/Search products/i) as HTMLInputElement;
  await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(160); });
    // Two results
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
    // Highlight mark exists inside first result name
    const first = options[0].querySelector('mark');
    expect(first).not.toBeNull();
  });

  it('stores recent searches and displays them when cleared', async () => {
    renderModal(true);
    const input = screen.getByLabelText(/Search products/i) as HTMLInputElement;
  await act(async () => { fireEvent.change(input, { target: { value: 'urban' } }); vi.advanceTimersByTime(170); });
    // Ensure debounce callback executed and state committed
    await act(async () => { vi.runAllTimers(); });
    // Sanity: results should exist indicating effect ran
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    // Clear input (should trigger showing recent immediately since open and recent state set)
    await act(async () => { fireEvent.change(input, { target: { value: '' } }); });
    // Flush any pending timers from clear
    await act(async () => { vi.runAllTimers(); });
    expect(screen.getByText('Tìm gần đây')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /urban/i })).toBeInTheDocument();
  });

  it('keyboard navigation moves active option and Enter triggers onClose + navigation', async () => {
    const onClose = vi.fn();
    // Mock window.location.href safely
    const originalHref = window.location.href;
    const locationMock: any = { ...window.location };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true });

    renderModal(true, onClose);
    const input = screen.getByLabelText(/Search products/i) as HTMLInputElement;
  await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(170); });
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    // Arrow down twice (wrap in act to silence warnings)
    await act(async () => {
      fireEvent.keyDown(listbox, { key: 'ArrowDown' }); // 0 -> 1
    });
    // Assert second item now has aria-selected
    let options = screen.getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    await act(async () => {
      fireEvent.keyDown(listbox, { key: 'ArrowDown' }); // 1 -> 0 (modulo)
      fireEvent.keyDown(listbox, { key: 'ArrowDown' }); // 0 -> 1 again
    });
    options = screen.getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');

  // Enter selects second result
  await act(async () => { fireEvent.keyDown(listbox, { key: 'Enter' }); });

    expect(onClose).toHaveBeenCalled();
    expect(window.location.href).toMatch(/street-pro-black/);
    // Restore original href
    window.location.href = originalHref;
  });
});
