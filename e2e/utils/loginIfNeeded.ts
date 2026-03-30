import type { Page } from '@playwright/test';

export default async function loginIfNeeded(
  page: Page,
  options: {
    url: string;
    username?: string;
    password?: string;
    postLoginSelector?: string;
  },
) {
  const { url, username = 'root', password = 'root', postLoginSelector } = options;
  const targetPathname = new URL(url).pathname;

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const onLoginPage = await page
    .locator('#username')
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (onLoginPage) {
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('form button.ant-btn-primary').click();
    await page.waitForURL((currentURL) => currentURL.pathname === targetPathname, { timeout: 120_000 });
    await page.waitForLoadState('domcontentloaded');
  }

  if (postLoginSelector) {
    await page.waitForSelector(postLoginSelector, { timeout: 120_000 });
  }
}
