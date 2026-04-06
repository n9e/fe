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
  const usernameInput = page
    .locator('#username')
    .or(page.getByLabel(/账户|用户名/))
    .or(page.getByPlaceholder('请输入用户名'))
    .first();
  const passwordInput = page
    .locator('#password')
    .or(page.getByLabel('密码'))
    .or(page.getByPlaceholder('请输入密码'))
    .first();

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const alreadyLoggedIn = postLoginSelector
    ? await page
        .locator(postLoginSelector)
        .waitFor({ state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false)
    : false;
  const onLoginPage = alreadyLoggedIn
    ? false
    : await usernameInput
        .waitFor({ state: 'visible', timeout: 120_000 })
        .then(() => true)
        .catch(() => false);

  if (onLoginPage) {
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await page.locator('form button.ant-btn-primary').click();
    await page.waitForURL((currentURL) => currentURL.pathname === targetPathname, { timeout: 120_000 });
    await page.waitForLoadState('domcontentloaded');
  }

  if (postLoginSelector) {
    await page.waitForSelector(postLoginSelector, { timeout: 120_000 });
  }
}
