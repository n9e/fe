import { test as base, type Page } from '@playwright/test';
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';
import { PlaywrightAiFixture } from '@midscene/web/playwright';
import 'dotenv/config';

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:8765';

const E2E_USERNAME = process.env.E2E_USERNAME ?? 'root';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'root';

export const test = base.extend<PlayWrightAiFixtureType>(
  PlaywrightAiFixture({
    forceChromeSelectRendering: false,
    waitForNetworkIdleTimeout: 2000,
  }),
);

test.use({
  viewport: { width: 1440, height: 720 },
});

export async function doLogin(page: Page) {
  const resp = await page.request.post(`${BASE_URL}/api/n9e/auth/login`, {
    data: {
      username: E2E_USERNAME,
      password: E2E_PASSWORD,
    },
  });
  const body = await resp.json();
  const { access_token, refresh_token } = body.dat || {};

  if (!access_token) {
    throw new Error(`Login failed: ${JSON.stringify(body)}`);
  }

  return { access_token, refresh_token };
}

export async function loginAndSetTokens(page: Page) {
  const { access_token, refresh_token } = await doLogin(page);

  await page.addInitScript(
    (tokens: { access_token: string; refresh_token?: string }) => {
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
    },
    { access_token, refresh_token },
  );
}
