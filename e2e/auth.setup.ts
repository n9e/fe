import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '@playwright/test';

import getBaseURL from './utils/getBaseURL';
import loginIfNeeded from './utils/loginIfNeeded';

const authFile = path.resolve(__dirname, '.auth/user.json');
const dashboardURL = `${getBaseURL()}/dashboards/794`;

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await loginIfNeeded(page, {
    url: dashboardURL,
    postLoginSelector: '.dashboard-detail-container',
  });

  await expect(page.locator('.dashboard-detail-container')).toBeVisible();
  await page.context().storageState({ path: authFile });
});
