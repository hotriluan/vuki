import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ensureIndexLoad } from '../search';

// Mock fetch to simulate small network delay and index payload
beforeAll(() => {
  let called = false;
  (globalThis as any).fetch = vi.fn(async (url: string) => {
    if (url === '/search-index.json') {
      // simulate latency ~10ms
      if (!called) {
        called = true;
        await new Promise(res => setTimeout(res, 10));
      }
      return { json: async () => ([
        { id: 'p-1', slug: 'urban-runner-white', name: 'Urban Runner White', description: 'Lightweight everyday sneaker' },
        { id: 'p-2', slug: 'street-pro-black', name: 'Street Pro Black', description: 'Cushioned black runner shoe' }
      ]) } as any;
    }
    throw new Error('Unexpected fetch ' + url);
  });
});

describe('search index performance', () => {
  it('loads index under 120ms threshold (including Fuse build)', async () => {
    const start = performance.now();
    await ensureIndexLoad();
    const dur = performance.now() - start;
    // Generous threshold; adjust if environment variance large
    expect(dur).toBeLessThan(120);
  });
});
