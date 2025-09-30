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
