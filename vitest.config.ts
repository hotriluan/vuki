import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    environment: 'jsdom',
  setupFiles: ['./vitest.db.setup.ts', './vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      // Added 'json-summary' so scripts/check-coverage.mjs can read coverage/coverage-summary.json
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/lib/placeholder.ts',
        '.next/**',
        'next.config.*',
        'postcss.config.*',
        'tailwind.config.*',
        'vitest.config.*'
      ],
      thresholds: {
        lines: 55,
        statements: 55,
        branches: 40,
        functions: 50
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
