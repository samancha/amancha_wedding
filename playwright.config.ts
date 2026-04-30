import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',

  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // iPhone — WebKit (mirrors iOS Safari)
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    // Android — Chromium (mirrors Chrome on Android)
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
