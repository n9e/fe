import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'e2e');
    localStorage.setItem('i18nextLng', 'zh_CN');
  });

  await page.route('**/api/n9e/self/profile**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        err: '',
        dat: {
          id: 1,
          username: 'e2e',
          nickname: 'e2e',
          roles: ['Admin'],
        },
      }),
    });
  });

  await page.route('**/api/n9e/self/perms**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: ['/dashboards/put'] }),
    });
  });

  await page.route('**/api/n9e/busi-groups**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: [{ id: 1, name: 'bg' }] }),
    });
  });

  await page.route('**/api/n9e/datasource/brief**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: [] }),
    });
  });

  await page.route('**/api/n9e/install-date**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: 0 }),
    });
  });

  await page.route('**/api/n9e/site-info**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: '' }),
    });
  });

  await page.route('**/api/n9e/versions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: { version: '0.0.0', github_verison: '0.0.0' } }),
    });
  });

  await page.route('**/api/n9e-plus/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/targets')) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: {} }),
    });
  });

  await page.route('**/api/**/proxy/**/api/v1/label/region/values**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: ['bj:1', 'sh:2'] }),
    });
  });

  await page.route('**/api/**/proxy/**/api/v1/series**', async (route) => {
    const url = new URL(route.request().url());
    const match = url.searchParams.get('match[]') || '';
    const instances = match.includes('region="2"') ? ['i-2a', 'i-2b'] : ['i-1a', 'i-1b'];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: instances.map((instance) => ({ instance })) }),
    });
  });

  await page.route('**/api/n9e/targets**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        err: '',
        dat: {
          list: [{ ident: 'host-a' }, { ident: 'host-b' }, { ident: 'host-a' }],
        },
      }),
    });
  });

  await page.route('**/api/n9e-plus/targets**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        err: '',
        dat: {
          list: [{ ident: 'host-a' }, { ident: 'host-b' }, { ident: 'host-a' }],
        },
      }),
    });
  });

  await page.route('**/api/n9e/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/n9e/proxy/')) {
      await route.fallback();
      return;
    }
    if (url.includes('/api/n9e/targets')) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ err: '', dat: [] }),
    });
  });
});

async function readJsonFromPre(page: any, testId: string) {
  const text = await page.getByTestId(testId).textContent();
  return JSON.parse(text || 'null');
}

async function openVariablesEditModal(page: any) {
  await page.getByTestId('open-edit').click({ force: true });
  const modalWrap = page.locator('.ant-modal-wrap.variable-modal:visible').first();
  await expect(modalWrap).toBeVisible();
  await expect(modalWrap.getByText('变量列表')).toBeVisible();
  return modalWrap;
}

async function openVariableEditor(dialog: any, variableName: string) {
  const row = dialog.locator('tbody tr').filter({ hasText: variableName }).first();
  await row.locator('a').click();
  await expect(dialog.getByText('编辑变量')).toBeVisible();
}
test('initializes variables and query options', async ({ page }) => {
  await page.goto('/__e2e__/dashboard-variables');

  const json = page.getByTestId('variables-json');
  await expect(json).toContainText('"name": "region"');
  await expect(json).toContainText('"optionsSize": 2');
  await expect(json).toContainText('"label": "bj"');
  await expect(json).toContainText('"value": "1"');

  await expect(json).toContainText('"name": "instance"');
  await expect(json).toContainText('"value": "i-1a"');

  await expect(json).toContainText('"name": "host"');
  await expect(json).toContainText('"label": "host-a"');
  await expect(json).toContainText('"label": "host-b"');
});

test('changing region refreshes dependent instance options', async ({ page }) => {
  await page.goto('/__e2e__/dashboard-variables');

  const group = page.locator('.input-group-with-form-item').filter({
    has: page.locator('.input-group-with-form-item-label', { hasText: 'region' }),
  });

  await group.locator('.ant-select-selector').click();
  await page.locator('.ant-select-dropdown:visible').getByText('sh', { exact: true }).click();

  const json = page.getByTestId('variables-json');
  await expect(json).toContainText('"name": "region"');
  await expect(json).toContainText('"value": "2"');
  await expect(json).toContainText('"name": "instance"');
  await expect(json).toContainText('"value": "i-2a"');
});

test('saves config without runtime fields and reflects UI edits', async ({ page }) => {
  await page.goto('/__e2e__/dashboard-variables');

  const dialog = await openVariablesEditModal(page);

  await openVariableEditor(dialog, 'region');
  await dialog.locator('.ant-form-item-label').filter({ hasText: '多选' }).locator('..').getByRole('switch').click();
  await dialog.locator('.ant-form-item-label').filter({ hasText: '包含全选' }).locator('..').getByRole('switch').click();
  await dialog.getByLabel('自定义全选值').fill('.*');
  await dialog.locator('.ant-btn-primary').click();

  await openVariableEditor(dialog, 'input');
  await dialog.getByLabel('默认值').fill('abc');
  await dialog.locator('.ant-btn-primary').click();

  await openVariableEditor(dialog, 'ds');
  await dialog.getByLabel('数据源过滤').fill('/prom-2/');
  await dialog.getByLabel('默认值').click();
  await page.locator('.ant-select-dropdown:visible').getByText('prom-2', { exact: true }).click();
  await dialog.locator('.ant-btn-primary').click();

  await dialog.locator('.ant-modal-close').click();

  const saved = (await readJsonFromPre(page, 'saved-config-json')) as any[];
  for (const item of saved) {
    expect(Object.prototype.hasOwnProperty.call(item, 'value')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(item, 'options')).toBe(false);
  }

  const region = saved.find((v: any) => v.name === 'region');
  expect(region.multi).toBe(true);
  expect(region.allOption).toBe(true);
  expect(region.allValue).toBe('.*');

  const input = saved.find((v: any) => v.name === 'input');
  expect(input.defaultValue).toBe('abc');

  const ds = saved.find((v: any) => v.name === 'ds');
  expect(ds.regex).toBe('/prom-2/');
  expect(ds.defaultValue).toBe(2);
});

test('replaces promql templates with current variable values', async ({ page }) => {
  await page.goto('/__e2e__/dashboard-variables');

  await expect(page.getByTestId('variables-json')).toContainText('"name": "instance"');
  await expect(page.getByTestId('variables-json')).toContainText('"value": "i-1a"');
  await expect(page.getByTestId('promql-replaced-0')).toContainText('region="1"');
  await expect(page.getByTestId('promql-replaced-0')).toContainText('instance="i-1a"');
  await expect(page.getByTestId('promql-replaced-0')).toContainText('env=~"(dev|prod)"');
  await expect(page.getByTestId('promql-replaced-0')).toContainText('const="CONST"');
  await expect(page.getByTestId('promql-replaced-0')).toContainText('input=""');

  const dialog = await openVariablesEditModal(page);
  await openVariableEditor(dialog, 'input');
  await dialog.getByLabel('默认值').fill('hello');
  await dialog.locator('.ant-btn-primary').click();
  await dialog.locator('.ant-modal-close').click();

  await expect(page.getByTestId('promql-replaced-0')).toContainText('input="hello"');
});
