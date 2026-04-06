import { test, expect, type Page, type Locator } from '@playwright/test';

import { mockPrometheusVariableRoutes } from '../utils/mockPrometheusVariableRoutes';
import { selectOptionClick } from '../utils/antdUtils';

import {
  openDashboard,
  openVariablesList,
  openAddVariableModal,
  closeVariablesList,
  getVariableGroup,
  selectFirstQueryOption,
  selectSpecificOrFirstQueryOption,
  cleanupDashboardState,
  addTextPanel,
  createQueryVariable,
  createCustomVariable,
} from './utils';

const prometheusDatasourceId = 639;
const prometheusDatasourceName = 'vm_cluster';
const mockPrometheusSeries = [
  {
    __name__: 'cpu_usage_idle',
    cpu: 'cpu-total',
    ident: 'bj-host-01',
    region: 'bj',
    env: 'test',
  },
  {
    __name__: 'cpu_usage_idle',
    cpu: 'cpu-total',
    ident: 'bj-host-02',
    region: 'bj',
    env: 'test',
  },
  {
    __name__: 'cpu_usage_idle',
    cpu: 'cpu-total',
    ident: 'sh-host-01',
    region: 'sh',
    env: 'prod',
  },
  {
    __name__: 'cpu_usage_idle',
    cpu: 'cpu-total',
    ident: 'sh-host-02',
    region: 'sh',
    env: 'prod',
  },
] as const;

async function setSwitchByLabel(container: Locator, label: string, value: boolean) {
  const switchLocator = container.locator('.ant-form-item').filter({ hasText: label }).getByRole('switch').first();
  if (!(await switchLocator.count())) return;
  const checked = (await switchLocator.getAttribute('aria-checked')) === 'true';
  if (checked !== value) {
    await switchLocator.click();
  }
}

async function createQueryVariableInModal(
  page: Page,
  options: {
    name: string;
    label: string;
    datasourceName: string;
    definition: string;
    regex: string;
    multi: boolean;
    allOption: boolean;
    allValue?: string;
    preview?: boolean;
  },
) {
  const modal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '添加变量' }),
  });
  await expect(modal).toBeVisible();

  await modal.locator('#name').fill(options.name);
  await modal.locator('#label').fill(options.label);
  const datasourceSelect = modal.getByLabel('数据源');
  await selectOptionClick(page, datasourceSelect, options.datasourceName);
  await modal.locator('#definition').fill(options.definition);

  const regexInput = modal.getByLabel('正则').or(modal.getByLabel('数据源过滤'));
  if (await regexInput.count()) {
    await regexInput.first().fill(options.regex);
  }

  await setSwitchByLabel(modal, '多选', options.multi);
  await setSwitchByLabel(modal, '包含全选', options.allOption);

  if (options.allOption && options.allValue) {
    const allValueInput = modal.getByLabel('自定义全选值');
    if (await allValueInput.count()) {
      await allValueInput.first().fill(options.allValue);
    }
  }

  if (options.preview) {
    const previewBtn = modal.getByRole('button', { name: '预览' });
    if (await previewBtn.count()) {
      await previewBtn.click();
      const previewModal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
        has: page.locator('.ant-modal-title', { hasText: '数据预览' }),
      });
      if (await previewModal.count()) {
        await previewModal.locator('.ant-modal-close').click();
        await expect(previewModal).toBeHidden();
      }
      await page.waitForTimeout(300);
    }
  }

  await modal.locator('button.ant-btn-primary').click({ force: true });
  await expect(modal).toBeHidden();
}

async function ensureVariablesListOpen(page: Page) {
  const listModal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
  });
  if (!(await listModal.count())) {
    const blockingModal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
      has: page.locator('.ant-modal-title', { hasText: /添加变量|编辑变量|数据预览/ }),
    }).first();
    if (await blockingModal.count()) {
      const closeBtn = blockingModal.locator('.ant-modal-close').first();
      if (await closeBtn.count()) {
        await closeBtn.click({ force: true });
      }
    }
    await openVariablesList(page);
  }
  return page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
  });
}

async function openVariableEditor(page: Page, variableName: string) {
  const listModal = await ensureVariablesListOpen(page);
  const row = listModal.locator('tbody tr').filter({ hasText: variableName }).first();
  await expect(row).toBeVisible();
  await row.locator('a').first().click();

  const editModal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '编辑变量' }),
  });
  await expect(editModal).toBeVisible();
  return { listModal, editModal };
}

async function cleanupByReloadAndStorage(page: Page) {
  await page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.includes('dashboard') || key.includes('variable')) {
        window.localStorage.removeItem(key);
      }
    });
  });
  await cleanupDashboardState(page);
}

async function selectMultipleOptions(page: Page, variableGroup: Locator, values: string[]) {
  for (const value of values) {
    await variableGroup.locator('.ant-select-selector').first().click();
    const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible();
    const option = dropdown.locator('.ant-select-item-option').filter({ hasText: value }).first();
    await expect(option).toBeVisible();
    await option.click({ force: true });
    await page.waitForTimeout(100);
  }
}

async function clickAllOption(page: Page, variableGroup: Locator) {
  await variableGroup.locator('.ant-select-selector').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown).toBeVisible();
  const allOption = dropdown
    .locator('.ant-select-item-option')
    .filter({ hasText: /All|全选/ })
    .first();
  if (await allOption.count()) {
    await allOption.click();
    return;
  }
  await dropdown.locator('.ant-select-item-option').first().click();
}

test.describe('query feature scenarios', () => {
  test.setTimeout(180_000);

  test('场景大纲: 编辑 query 变量', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `ident_edit_${uniqueSuffix}`;
    const queryVarLabel = `机器编辑_${uniqueSuffix}`;
    const queryDef = `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`;
    const queryReg = '/i-.*/';
    const allValue = '__all__';

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariableInModal(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: queryDef,
      regex: queryReg,
      multi: false,
      allOption: false,
      allValue,
      preview: true,
    });

    const { editModal } = await openVariableEditor(page, queryVarName);
    await expect(editModal.locator('#name')).toHaveValue(queryVarName);
    await expect(editModal.locator('#label')).toHaveValue(queryVarLabel);
    await expect(editModal.locator('#definition')).toHaveValue(queryDef);
    await expect(editModal).toContainText(mock.datasource.name);

    const regexInput = editModal.getByLabel('正则').or(editModal.getByLabel('数据源过滤')).first();
    if (await regexInput.count()) {
      await expect(regexInput).toHaveValue(queryReg);
    }
    await closeVariablesList(page);
    await cleanupByReloadAndStorage(page);
  });

  test('场景大纲: 渲染 query 变量和文本卡片 panel', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `ident_${uniqueSuffix}`;
    const queryVarLabel = `推荐 Query 下游变量别名_${uniqueSuffix}`;
    const panelTitle = `Query Panel ${uniqueSuffix}`;

    await openDashboard(page);

    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    await addTextPanel(page, {
      title: panelTitle,
      content: `selected=$${queryVarName}`,
    });

    const variableGroup = getVariableGroup(page, queryVarLabel);
    await expect(variableGroup).toBeVisible();
    await expect(variableGroup).toContainText(queryVarLabel);
    const selectedValue = await selectFirstQueryOption(page, variableGroup);
    expect(selectedValue).toBe(mock.sampleDownstreamValue);
    await expect(page.getByText(`selected=${selectedValue}`, { exact: false }).first()).toBeVisible();

    await cleanupByReloadAndStorage(page);
  });

  test('场景大纲: 交互 query 变量', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `ident_interact_${uniqueSuffix}`;
    const queryVarLabel = `机器交互_${uniqueSuffix}`;
    const panelTitle = `Query Interact Panel ${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    await addTextPanel(page, {
      title: panelTitle,
      content: `selected=$${queryVarName}`,
    });

    const variableGroup = getVariableGroup(page, queryVarLabel);
    const chosen = await selectSpecificOrFirstQueryOption(page, variableGroup, mock.sampleDownstreamValue);
    await expect(page.getByText(`selected=${chosen}`, { exact: false }).first()).toBeVisible();

    await cleanupByReloadAndStorage(page);
  });

  test('场景大纲: 多选 query 变量', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `ident_multi_${uniqueSuffix}`;
    const queryVarLabel = `机器多选_${uniqueSuffix}`;
    const panelTitle = `Query Multi Panel ${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariableInModal(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`,
      regex: '/.*/',
      multi: true,
      allOption: true,
      allValue: '.*',
    });
    await closeVariablesList(page);

    await addTextPanel(page, {
      title: panelTitle,
      content: `selected=$${queryVarName}`,
    });

    const variableGroup = getVariableGroup(page, queryVarLabel);
    await clickAllOption(page, variableGroup);
    await expect(variableGroup).toContainText(/All|全选/);

    const clearBtn = variableGroup.locator('.ant-select-clear').first();
    if (await clearBtn.count()) {
      await clearBtn.click();
    }
    await expect(variableGroup.locator('.ant-select-selection-item')).toHaveCount(0);

    await cleanupByReloadAndStorage(page);
  });

  test('场景: Prometheus 单选依赖单选', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const upstreamVarName = `region_${uniqueSuffix}`;
    const upstreamVarLabel = `地域_${uniqueSuffix}`;
    const downstreamVarName = `ident_${uniqueSuffix}`;
    const downstreamVarLabel = `机器_${uniqueSuffix}`;
    const panelTitle = `Query Linkage Panel ${uniqueSuffix}`;

    await openDashboard(page);

    await openVariablesList(page);
    await openAddVariableModal(page);
    await createCustomVariable(page, {
      name: upstreamVarName,
      label: upstreamVarLabel,
      definition: `${mock.linkage.upstreamValues[0]}, ${mock.linkage.upstreamValues[1]}`,
    });

    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: downstreamVarName,
      label: downstreamVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}{${mock.linkage.upstreamLabel}="$${upstreamVarName}"}, ${mock.linkage.downstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    await addTextPanel(page, {
      title: panelTitle,
      content: `upstream=$${upstreamVarName}, downstream=$${downstreamVarName}`,
    });

    const upstreamGroup = getVariableGroup(page, upstreamVarLabel);
    const downstreamGroup = getVariableGroup(page, downstreamVarLabel);
    await expect(upstreamGroup).toBeVisible();
    await expect(downstreamGroup).toBeVisible();

    await selectOptionClick(page, upstreamGroup.locator('.ant-select').first(), mock.linkage.upstreamValues[0]);
    const firstValue = await selectSpecificOrFirstQueryOption(page, downstreamGroup, mock.linkage.sampleDownstreamValue);
    await expect(page.getByText(`upstream=${mock.linkage.upstreamValues[0]}, downstream=${firstValue}`, { exact: false }).first()).toBeVisible();

    await selectOptionClick(page, upstreamGroup.locator('.ant-select').first(), mock.linkage.upstreamValues[1]);
    const secondValue = await selectSpecificOrFirstQueryOption(page, downstreamGroup, mock.linkage.sampleOtherDownstreamValue);
    await expect(page.getByText(`upstream=${mock.linkage.upstreamValues[1]}, downstream=${secondValue}`, { exact: false }).first()).toBeVisible();

    await cleanupByReloadAndStorage(page);
  });

  test('场景: Prometheus 单选依赖多选', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const upstreamVarName = `region_single_${uniqueSuffix}`;
    const upstreamVarLabel = `上游单选_${uniqueSuffix}`;
    const downstreamVarName = `ident_multi_dep_${uniqueSuffix}`;
    const downstreamVarLabel = `下游多选_${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createCustomVariable(page, {
      name: upstreamVarName,
      label: upstreamVarLabel,
      definition: `${mock.linkage.upstreamValues[0]}, ${mock.linkage.upstreamValues[1]}`,
    });

    await openAddVariableModal(page);
    await createQueryVariableInModal(page, {
      name: downstreamVarName,
      label: downstreamVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}{${mock.linkage.upstreamLabel}="$${upstreamVarName}"}, ${mock.linkage.downstreamLabel})`,
      regex: '/.*/',
      multi: true,
      allOption: true,
      allValue: '.*',
    });
    await closeVariablesList(page);

    const upstreamGroup = getVariableGroup(page, upstreamVarLabel);
    const downstreamGroup = getVariableGroup(page, downstreamVarLabel);
    await selectOptionClick(page, upstreamGroup.locator('.ant-select').first(), mock.linkage.upstreamValues[0]);
    await clickAllOption(page, downstreamGroup);
    await expect(downstreamGroup).toContainText(/All|全选/);

    await selectOptionClick(page, upstreamGroup.locator('.ant-select').first(), mock.linkage.upstreamValues[1]);
    await selectSpecificOrFirstQueryOption(page, downstreamGroup, mock.linkage.sampleOtherDownstreamValue);

    await cleanupByReloadAndStorage(page);
  });

  test('场景: Prometheus 多选依赖查询', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const upstreamVarName = `region_multi_${uniqueSuffix}`;
    const upstreamVarLabel = `上游多选_${uniqueSuffix}`;
    const downstreamVarName = `ident_dep_${uniqueSuffix}`;
    const downstreamVarLabel = `下游联动_${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createCustomVariable(page, {
      name: upstreamVarName,
      label: upstreamVarLabel,
      definition: `${mock.linkage.upstreamValues[0]}, ${mock.linkage.upstreamValues[1]}`,
    });

    const { editModal } = await openVariableEditor(page, upstreamVarName);
    await setSwitchByLabel(editModal, '多选', true);
    await editModal.locator('button.ant-btn-primary').click();
    await expect(editModal).toBeHidden();

    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: downstreamVarName,
      label: downstreamVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}{${mock.linkage.upstreamLabel}=~"$${upstreamVarName}"}, ${mock.linkage.downstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    const upstreamGroup = getVariableGroup(page, upstreamVarLabel);
    const downstreamGroup = getVariableGroup(page, downstreamVarLabel);
    await selectMultipleOptions(page, upstreamGroup, [mock.linkage.upstreamValues[0], mock.linkage.upstreamValues[1]]);
    await expect(downstreamGroup).toBeVisible();
    await downstreamGroup.locator('.ant-select-selector').first().click();
    const downstreamDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(downstreamDropdown).toBeVisible();

    const clearBtn = upstreamGroup.locator('.ant-select-clear').first();
    if (await clearBtn.count()) {
      await clearBtn.click();
    }
    await expect(downstreamGroup).toBeVisible();

    await cleanupByReloadAndStorage(page);
  });

  test('场景: 通过真实 Prometheus series 组织依赖测试数据', async ({ page }) => {
    await expect(
      mockPrometheusVariableRoutes(page, {
        datasourceId: prometheusDatasourceId,
        datasourceName: prometheusDatasourceName,
        series: [],
      }),
    ).rejects.toThrow('Mock Prometheus series must include __name__');

    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    expect(mock.linkage.upstreamValues.length).toBe(2);
    expect(mock.linkage.sampleDownstreamValue).toBeTruthy();
    expect(mock.linkage.sampleOtherDownstreamValue).toBeTruthy();
  });

  test('场景: 会话内回显 query 变量', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `echo_${uniqueSuffix}`;
    const queryVarLabel = `回显变量_${uniqueSuffix}`;
    const definition = `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariableInModal(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition,
      regex: '/.*/',
      multi: true,
      allOption: true,
      allValue: '.*',
    });

    const { editModal } = await openVariableEditor(page, queryVarName);
    await expect(editModal).toContainText(mock.datasource.name);
    await expect(editModal.locator('#definition')).toHaveValue(definition);
    const regexInput = editModal.getByLabel('正则').or(editModal.getByLabel('数据源过滤')).first();
    if (await regexInput.count()) {
      await expect(regexInput).toHaveValue('/.*/');
    }

    const multiSwitch = editModal.locator('.ant-form-item').filter({ hasText: '多选' }).getByRole('switch').first();
    const allSwitch = editModal.locator('.ant-form-item').filter({ hasText: '包含全选' }).getByRole('switch').first();
    if (await multiSwitch.count()) {
      await expect(multiSwitch).toHaveAttribute('aria-checked', 'true');
    }
    if (await allSwitch.count()) {
      await expect(allSwitch).toHaveAttribute('aria-checked', 'true');
    }
    await closeVariablesList(page);

    await cleanupByReloadAndStorage(page);
  });

  test('场景: query feature 结束后清理环境', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `cleanup_feature_${uniqueSuffix}`;
    const queryVarLabel = `清理变量_${uniqueSuffix}`;
    const panelTitle = `Cleanup Feature ${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    await addTextPanel(page, {
      title: panelTitle,
      content: `selected=$${queryVarName}`,
    });

    await cleanupByReloadAndStorage(page);

    await expect(page.getByText(queryVarLabel, { exact: false })).toHaveCount(0);
    await expect(page.getByText(panelTitle, { exact: true })).toHaveCount(0);
  });

  test('场景: query 独立场景执行后清理环境', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `cleanup_single_${uniqueSuffix}`;
    const queryVarLabel = `清理场景变量_${uniqueSuffix}`;

    await openDashboard(page);
    await openVariablesList(page);
    await openAddVariableModal(page);
    await createQueryVariable(page, {
      name: queryVarName,
      label: queryVarLabel,
      datasourceName: mock.datasource.name,
      definition: `label_values(${mock.metricName}, ${mock.defaultDownstreamLabel})`,
      regex: '/.*/',
    });
    await closeVariablesList(page);

    await cleanupByReloadAndStorage(page);

    await openVariablesList(page);
    const listModal = page.locator('.ant-modal-wrap:visible .ant-modal').filter({
      has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
    });
    await expect(listModal.getByText(queryVarName, { exact: true })).toHaveCount(0);
    await closeVariablesList(page);
  });
});
