import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://sapere-system.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium-production',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/examine-production.spec.ts'],
    },
  ],

  timeout: 60000,
});