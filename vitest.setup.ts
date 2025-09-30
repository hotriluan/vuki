import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock next/link để tránh các state update nội bộ gây warning act trong test
vi.mock('next/link', () => ({
	__esModule: true,
	default: ({ href, children, ...rest }: any) => React.createElement('a', { href: typeof href === 'string' ? href : '#', ...rest }, children)
}));

// Mock matchMedia for ThemeContext tests
if (typeof window !== 'undefined' && !window.matchMedia) {
	// @ts-ignore
	window.matchMedia = (query: string) => ({
		matches: query.includes('dark') ? false : false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {}, // legacy
		removeListener: () => {}, // legacy
		dispatchEvent: () => false
	});
}

// Mock IntersectionObserver for components relying on it (e.g., carousel libs)
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  // @ts-ignore
  window.IntersectionObserver = class {
    constructor(callback: any) { this._callback = callback; }
    _callback: any;
    observe() { /* no-op */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
    takeRecords() { return []; }
  };
}

// Mock ResizeObserver (used by Embla for size recalculation in some environments)
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
	// @ts-ignore
	window.ResizeObserver = class {
		observe() { /* no-op */ }
		unobserve() { /* no-op */ }
		disconnect() { /* no-op */ }
	};
}
