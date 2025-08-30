import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3000' },
  webServer: {
    command: 'pnpm -C apps/starter build && pnpm -C apps/starter start -p 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});

