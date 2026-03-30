import { test, expect } from '@playwright/test';
import getBaseURL from '../utils/getBaseURL';
import getAuthRequestHeaders from '../utils/getAuthRequestHeaders';
import loginIfNeeded from '../utils/loginIfNeeded';

const baseURL = getBaseURL();
const dashboardURL = `${baseURL}/dashboards/794`;

test('creates query variable with datasource id 1 and saves', async ({ page }) => {
  test.setTimeout(180_000);
  await loginIfNeeded(page, {
    url: dashboardURL,
    postLoginSelector: '.dashboard-detail-container',
  });

  const headers = await getAuthRequestHeaders(page);
  const dsResp = await page.request.get(`${baseURL}/api/n9e/datasource/brief`, {
    headers,
  });
  expect(dsResp.ok()).toBe(true);
  const dsJson = (await dsResp.json()) as any;
  const ds1 = (dsJson?.dat || []).find((d: any) => d?.id === 639);
  expect(ds1?.name).toBe('vm_cluster');
  expect(ds1?.plugin_type).toBe('prometheus');

  await page.locator('.dashboard-detail-container a').filter({ hasText: '添加变量' }).first().click();

  const listModal = page.locator('.ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
  });
  await expect(listModal).toBeVisible();
  await listModal.locator('.ant-table-footer .ant-btn-primary').click();

  const addModal = page.locator('.ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '添加变量' }),
  });
  await expect(addModal).toBeVisible();

  const variableName = `cpu_ident_e2e_${Math.floor(Date.now() / 1000)}`;
  await addModal.locator('#name').fill(variableName);
  await addModal.locator('#label').fill(variableName);

  await expect(addModal).toContainText('查询 (Query)');

  await addModal.getByLabel('数据源').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  await expect(dropdown).toBeVisible();
  await dropdown
    .locator('.ant-select-item-option')
    .filter({ hasText: /vm_cluster/i })
    .first()
    .click();

  await addModal.locator('#definition').fill('label_values(cpu_usage_idle, ident)');

  await addModal.locator('button.ant-btn-primary').click();

  await expect(addModal).toBeHidden();
  await expect(listModal).toBeVisible();
  await expect(listModal).toContainText(variableName);
  await expect(listModal).toContainText('查询 (Query)');
  await expect(listModal).toContainText('label_values(cpu_usage_idle, ident)');
});
