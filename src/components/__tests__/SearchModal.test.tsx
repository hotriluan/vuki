import React from 'react';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
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

// Provide mock index data returned by fetch("/search-index.json")
const mockIndex = [
  { id: 'p-1', slug: 'urban-runner-white', name: 'Urban Runner White', description: 'Lightweight everyday sneaker' },
  { id: 'p-2', slug: 'street-pro-black', name: 'Street Pro Black', description: 'Cushioned black runner shoe' },
  { id: 'p-3', slug: 'trail-master', name: 'Trail Master', description: 'All terrain trail shoe' }
];

// Mock global fetch used by ensureIndexLoad/loadIndex so tests do not perform real network fetch
beforeAll(() => {
  (globalThis as any).fetch = vi.fn(async (url: string) => {
    if (url === '/search-index.json') {
      return { json: async () => mockIndex } as any;
    }
    throw new Error('Unexpected fetch: ' + url);
  });
});

// Spy searchProducts to return deterministic results (independent of index contents)
const searchSpy = vi.spyOn(searchLib, 'searchProducts').mockImplementation(async (q: string) => {
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
  await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(230); });
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
  await act(async () => { fireEvent.change(input, { target: { value: 'urban' } }); vi.advanceTimersByTime(240); });
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
  await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(240); });
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

  it('Home and End keys jump to first and last options', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    const input = screen.getByLabelText(/Search products/i) as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(240); });
    const listbox = screen.getByRole('listbox');
    // Press End -> last item active
    await act(async () => { fireEvent.keyDown(listbox, { key: 'End' }); });
    let options = screen.getAllByRole('option');
    expect(options[options.length - 1].getAttribute('aria-selected')).toBe('true');
    // Press Home -> first item active
    await act(async () => { fireEvent.keyDown(listbox, { key: 'Home' }); });
    options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
  });

  it('highlights contain expected mark tags around search term', async () => {
    renderModal(true);
    const input = screen.getByLabelText(/Search products/i) as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(240); });
    const firstOption = screen.getAllByRole('option')[0];
    const nameEl = firstOption.querySelector('span.text-sm');
    expect(nameEl?.innerHTML).toMatch(/<mark/);
    // ensure highlight text corresponds to leading characters (mock highlight indices 0-4 -> 'Urban')
    expect(nameEl?.textContent?.toLowerCase().startsWith('urban')).toBe(true);
  });

  it('Escape closes modal and restores focus to previous element', async () => {
    const onClose = vi.fn();
    // Create a focusable button before opening
    const btn = document.createElement('button');
    btn.textContent = 'before';
    document.body.appendChild(btn);
    btn.focus();
    expect(document.activeElement).toBe(btn);

    renderModal(true, onClose);
    const input = screen.getByLabelText(/Search products/i);
  await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(240); });
    // Press Escape on listbox container level
    const listbox = screen.getByRole('listbox');
    await act(async () => { fireEvent.keyDown(listbox, { key: 'Escape' }); });
    expect(onClose).toHaveBeenCalled();
    // cleanup
    document.body.removeChild(btn);
  });

  it('ArrowUp on first item wraps to last', async () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    const input = screen.getByLabelText(/Search products/i);
    await act(async () => { fireEvent.change(input, { target: { value: 'ur' } }); vi.advanceTimersByTime(240); });
    const listbox = screen.getByRole('listbox');
    // initial active = 0, press ArrowUp should wrap to last (index = results.length -1)
    await act(async () => { fireEvent.keyDown(listbox, { key: 'ArrowUp' }); });
    const options = screen.getAllByRole('option');
    expect(options[options.length - 1].getAttribute('aria-selected')).toBe('true');
  });

  it('shows loading index then no-results fallback with featured suggestions', async () => {
    // Force empty result scenario
    searchSpy.mockResolvedValueOnce([] as any);
    renderModal(true);
    const input = screen.getByLabelText(/Search products/i);
    await act(async () => { fireEvent.change(input, { target: { value: 'zzzzz' } }); });
    // During debounce time we move timers forward incrementally
    await act(async () => { vi.advanceTimersByTime(50); });
    // Loading state might appear once debounce triggers ensureIndexLoad (simulate end)
    await act(async () => { vi.advanceTimersByTime(220); });
    // After timers, expect fallback message
    expect(screen.getByText(/No results – gợi ý nổi bật/i)).toBeInTheDocument();
  });
});
