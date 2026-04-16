import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // chạy tuần tự để tránh conflict DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/reports/html', open: 'never' }],
    ['json', { outputFile: 'tests/reports/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    // Dùng Chrome hệ thống thay vì download Playwright chromium
    channel: 'chrome',
  },
  projects: [
    // Global setup: tạo test accounts
    {
      name: 'global-setup',
      testMatch: /global\.setup\.ts/,
    },
    // Auth setup: lưu auth state (chạy sau global-setup)
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['global-setup'],
    },

    // Desktop Chrome — chạy sau auth-setup
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['auth-setup'],
    },

    // Mobile Chrome — viewport 390px
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
        viewport: { width: 390, height: 844 },
      },
      dependencies: ['auth-setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Dev server đang chạy rồi
    timeout: 30000,
  },
});
