import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecentlyViewed, pushRecentlyViewed } from '../recentlyViewed';

// JSDOM has localStorage, ensure clean before each
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
});

describe('recentlyViewed', () => {
  it('adds new entry to front and trims limit', () => {
    for (let i = 0; i < 10; i++) {
      pushRecentlyViewed('p-' + i);
    }
    const list = getRecentlyViewed();
    expect(list.length).toBe(8); // limit
    expect(list[0].id).toBe('p-9');
  });

  it('deduplicates existing id and moves to front', () => {
    pushRecentlyViewed('p-1');
    vi.advanceTimersByTime(1000);
    pushRecentlyViewed('p-2');
    vi.advanceTimersByTime(1000);
    pushRecentlyViewed('p-1');
    const list = getRecentlyViewed();
    expect(list[0].id).toBe('p-1');
    expect(list.length).toBe(2);
  });

  it('returns empty array on invalid stored json', () => {
    localStorage.setItem('recently-viewed:v1', '{bad json');
    expect(getRecentlyViewed()).toEqual([]);
  });
});
