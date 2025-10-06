import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Only run basic tests for CI initially
    include: ['src/lib/__tests__/basic.test.ts', 'src/lib/__tests__/integration.integration.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        '.next/**',
        'next.config.*',
        'postcss.config.*',
        'tailwind.config.*',
        'vitest.config.*'
      ],
      thresholds: {
        lines: 10,
        statements: 10, 
        branches: 10,
        functions: 10
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
