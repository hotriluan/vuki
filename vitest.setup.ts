import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock next/link để tránh các state update nội bộ gây warning act trong test
vi.mock('next/link', () => ({
	__esModule: true,
	default: ({ href, children, ...rest }: any) => React.createElement('a', { href: typeof href === 'string' ? href : '#', ...rest }, children)
}));
