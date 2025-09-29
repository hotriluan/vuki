import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../WishlistContext';

function setup() {
  const wrapper = ({ children }: { children: React.ReactNode }) => <WishlistProvider>{children}</WishlistProvider>;
  const { result } = renderHook(() => useWishlist(), { wrapper });
  return result;
}

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds item and prevents duplicates', () => {
    const result = setup();
    act(() => {
      result.current.add('p-1');
      result.current.add('p-1');
    });
    expect(result.current.items).toEqual(['p-1']);
    expect(result.current.count).toBe(1);
  });

  it('removes item', () => {
    const result = setup();
    act(() => {
      result.current.add('p-2');
      result.current.remove('p-2');
    });
    expect(result.current.items).toEqual([]);
  });

  it('toggle adds then removes', () => {
    const result = setup();
    act(() => {
      result.current.toggle('p-3');
    });
    expect(result.current.has('p-3')).toBe(true);
    act(() => {
      result.current.toggle('p-3');
    });
    expect(result.current.has('p-3')).toBe(false);
  });

  it('clear empties list', () => {
    const result = setup();
    act(() => {
      result.current.add('p-4');
      result.current.add('p-5');
      result.current.clear();
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('persists to localStorage and rehydrates', () => {
    // first render add items
    let result = setup();
    act(() => {
      result.current.add('p-9');
      result.current.add('p-10');
    });
    expect(JSON.parse(localStorage.getItem('wishlist:v1') || '{}').items).toEqual(['p-9', 'p-10']);

    // unmount by re-running setup (renderHook creates new instance)
    result = setup();
    // state should restore (effect runs async microtask; renderHook already runs effects)
    expect(result.current.items.sort()).toEqual(['p-10', 'p-9'].sort());
  });
});
