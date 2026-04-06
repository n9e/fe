import path from 'path';
import { defineConfig } from '@playwright/test';

const authFile = path.join(__dirname, 'e2e/.auth/user.json');

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:9876',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:9876/__e2e__/dashboard-variables',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'e2e',
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      use: {
        storageState: authFile,
      },
    },
  ],
});
