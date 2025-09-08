import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/e2e/**',
      '**/*.e2e.*',
      '**/node_modules/**',
      '**/.next/**',
    ],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
      lines: 0
    }
  }
});
