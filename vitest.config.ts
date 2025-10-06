import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Only run basic tests for CI initially
    include: ['src/lib/__tests__/basic.test.ts', 'src/lib/__tests__/currency.test.ts', 'src/lib/__tests__/integration.integration.test.ts'],
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
      // thresholds: {
      //   lines: 1,
      //   statements: 1, 
      //   branches: 1,
      //   functions: 1
      // }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
