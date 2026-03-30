import type { Page } from '@playwright/test';

export default async function getAuthRequestHeaders(page: Page) {
  const { accessToken, language } = await page.evaluate(() => ({
    accessToken: window.localStorage.getItem('access_token') || '',
    language: window.localStorage.getItem('language') || 'zh_CN',
  }));

  if (!accessToken) {
    throw new Error('No access_token found in localStorage after login');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Language': language,
  };
}
