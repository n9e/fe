import { test, expect, type Page, type Locator } from '@playwright/test';

import getBaseURL from '../utils/getBaseURL';
import loginIfNeeded from '../utils/loginIfNeeded';
import { mockPrometheusVariableRoutes } from '../utils/mockPrometheusVariableRoutes';

const baseURL = getBaseURL();
const dashboardId = 794;
const dashboardURL = `${baseURL}/dashboards/${dashboardId}`;
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

type CleanupTracker = {
  variableNames: string[];
  panelTitles: string[];
};

test.describe('query feature scenarios', () => {
  test.setTimeout(180_000);

  test('creates query variable from mocked prometheus data and renders in text panel', async ({ page }) => {
    const mock = await mockPrometheusVariableRoutes(page, {
      datasourceId: prometheusDatasourceId,
      datasourceName: prometheusDatasourceName,
      series: [...mockPrometheusSeries],
    });
    const uniqueSuffix = `${Date.now()}`;
    const queryVarName = `ident_${uniqueSuffix}`;
    const queryVarLabel = `机器_${uniqueSuffix}`;
    const panelTitle = `Query Panel ${uniqueSuffix}`;
    const cleanup = createCleanupTracker([queryVarName], [panelTitle]);

    await loginToDashboard(page);

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
    const selectedValue = await selectFirstQueryOption(variableGroup, page);
    expect(selectedValue).toBe(mock.sampleDownstreamValue);
    await expect(page.getByText(`selected=${selectedValue}`, { exact: false }).first()).toBeVisible();

    await cleanupDashboardState(page, cleanup);
  });

  test('refreshes dependent query options when upstream value changes', async ({ page }) => {
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
    const cleanup = createCleanupTracker([upstreamVarName, downstreamVarName], [panelTitle]);

    await loginToDashboard(page);

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

    await selectVariableOption(upstreamGroup, page, mock.linkage.upstreamValues[0]);
    const firstValue = await selectSpecificOrFirstQueryOption(downstreamGroup, page, mock.linkage.sampleDownstreamValue);
    await expect(page.getByText(`upstream=${mock.linkage.upstreamValues[0]}, downstream=${firstValue}`, { exact: false }).first()).toBeVisible();

    await selectVariableOption(upstreamGroup, page, mock.linkage.upstreamValues[1]);
    const secondValue = await selectSpecificOrFirstQueryOption(downstreamGroup, page, mock.linkage.sampleOtherDownstreamValue);
    await expect(page.getByText(`upstream=${mock.linkage.upstreamValues[1]}, downstream=${secondValue}`, { exact: false }).first()).toBeVisible();

    await cleanupDashboardState(page, cleanup);
  });
});

async function loginToDashboard(page: Page) {
  await loginIfNeeded(page, {
    url: dashboardURL,
    postLoginSelector: '.dashboard-detail-container',
  });
}

function createCleanupTracker(variableNames: string[], panelTitles: string[]): CleanupTracker {
  return { variableNames, panelTitles };
}

async function openVariablesList(page: Page) {
  await page.locator('.dashboard-detail-container a').filter({ hasText: '添加变量' }).first().click();
  await expect(getVariablesListModal(page)).toBeVisible();
}

async function closeVariablesList(page: Page) {
  const modal = getVariablesListModal(page);
  await modal.locator('.ant-modal-close').click();
  await expect(modal).toBeHidden();
}

async function openAddVariableModal(page: Page) {
  const listModal = getVariablesListModal(page);
  await listModal.locator('.ant-table-footer .ant-btn-primary').click();
  await expect(getAddVariableModal(page)).toBeVisible();
}

function getVariablesListModal(page: Page) {
  return page.locator('.ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
  });
}

function getAddVariableModal(page: Page) {
  return page.locator('.ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '添加变量' }),
  });
}

async function createCustomVariable(
  page: Page,
  options: {
    name: string;
    label: string;
    definition: string;
  },
) {
  const modal = getAddVariableModal(page);
  await modal.locator('#name').fill(options.name);
  await modal.locator('#label').fill(options.label);
  await chooseVariableType(page, modal, '自定义 (Custom)');
  await modal.locator('#definition').fill(options.definition);
  await modal.locator('button.ant-btn-primary').click();
  await expect(modal).toBeHidden();
  await expect(getVariablesListModal(page)).toContainText(options.name);
}

async function createQueryVariable(
  page: Page,
  options: {
    name: string;
    label: string;
    datasourceName: string;
    definition: string;
    regex: string;
  },
) {
  const modal = getAddVariableModal(page);
  await modal.locator('#name').fill(options.name);
  await modal.locator('#label').fill(options.label);
  await expect(modal).toContainText('查询 (Query)');

  await modal.getByLabel('数据源').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  await expect(dropdown).toBeVisible();
  await dropdown
    .locator('.ant-select-item-option')
    .filter({ hasText: new RegExp(`${escapeRegExp(options.datasourceName)}[\\s\\S]*Prometheus`, 'i') })
    .first()
    .click();

  await modal.locator('#definition').fill(options.definition);
  const regexInput = modal.getByLabel('正则').or(modal.getByLabel('数据源过滤'));
  if (await regexInput.count()) {
    await regexInput.first().fill(options.regex);
  }

  await modal.locator('button.ant-btn-primary').click();
  await expect(modal).toBeHidden();
  await expect(getVariablesListModal(page)).toContainText(options.name);
  await expect(getVariablesListModal(page)).toContainText(options.definition);
}

async function chooseVariableType(page: Page, modal: Locator, visibleText: string) {
  await modal.getByLabel('变量类型').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  await expect(dropdown).toBeVisible();
  await dropdown.getByText(visibleText, { exact: true }).click();
}

async function addTextPanel(
  page: Page,
  options: {
    title: string;
    content: string;
  },
) {
  await page.getByRole('button', { name: '添加图表' }).click();
  const dropdown = page.locator('.ant-dropdown:visible').first();
  await expect(dropdown).toBeVisible();
  await dropdown.getByText('文本卡片', { exact: true }).click();

  const editorModal = page.locator('.ant-modal-wrap:visible .ant-modal.n9e-dashboard-editor-modal').first();
  await expect(editorModal).toBeVisible();
  await editorModal.getByLabel('标题').fill(options.title);
  await getFormItemTextarea(editorModal, '内容').fill(options.content);
  await editorModal.getByRole('button', { name: '保存' }).click();
  await expect(editorModal).toBeHidden();
  await expect(page.getByText(options.title, { exact: true }).first()).toBeVisible();
}

function getVariableGroup(page: Page, label: string) {
  return page.locator('.input-group-with-form-item').filter({
    has: page.locator('.input-group-with-form-item-label', { hasText: label }),
  });
}

async function selectFirstQueryOption(group: Locator, page: Page) {
  await group.locator('.ant-select-selector').click();
  const option = page.locator('.ant-select-dropdown:visible .ant-select-item-option').first();
  await expect(option).toBeVisible();
  const text = (await option.textContent())?.trim() || '';
  await option.click();
  return text;
}

async function selectSpecificOrFirstQueryOption(group: Locator, page: Page, preferredValue: string) {
  await group.locator('.ant-select-selector').click();
  const visibleDropdown = page.locator('.ant-select-dropdown:visible').first();
  await expect(visibleDropdown).toBeVisible();
  const exactOption = visibleDropdown.getByText(preferredValue, { exact: true });
  if (await exactOption.count()) {
    await exactOption.first().click();
    return preferredValue;
  }
  const firstOption = visibleDropdown.locator('.ant-select-item-option').first();
  const text = (await firstOption.textContent())?.trim() || '';
  await firstOption.click();
  return text;
}

async function selectVariableOption(group: Locator, page: Page, value: string) {
  await group.locator('.ant-select-selector').click();
  const visibleDropdown = page.locator('.ant-select-dropdown:visible').first();
  await expect(visibleDropdown).toBeVisible();
  await visibleDropdown.getByText(value, { exact: true }).click();
}

async function cleanupDashboardState(page: Page, cleanup: CleanupTracker) {
  for (const panelTitle of cleanup.panelTitles) {
    await deletePanelByTitle(page, panelTitle);
  }
  if (cleanup.variableNames.length) {
    await deleteVariablesByNames(page, cleanup.variableNames);
    await page.evaluate(
      ({ names, id }) => {
        for (const name of names) {
          localStorage.removeItem(`dashboard_v6_${id}_${name}`);
        }
      },
      { names: cleanup.variableNames, id: dashboardId },
    );
  }
}

async function deletePanelByTitle(page: Page, panelTitle: string) {
  const panel = page
    .locator('.renderer')
    .filter({ has: page.getByText(panelTitle, { exact: true }) })
    .first();
  if (!(await panel.count())) return;
  await panel.hover();
  await panel.locator('.renderer-header-controller').last().click();
  const menu = page.locator('.ant-dropdown:visible').first();
  if (!(await menu.count())) return;
  await menu.getByText('删除', { exact: true }).click();
  const confirm = page.locator('.ant-modal-confirm:visible');
  if (await confirm.count()) {
    await confirm.getByRole('button', { name: '确定' }).click();
  }
  await expect(page.getByText(panelTitle, { exact: true })).toHaveCount(0);
}

async function deleteVariablesByNames(page: Page, names: string[]) {
  if (!names.length) return;
  await openVariablesList(page);
  const modal = getVariablesListModal(page);
  for (const name of names) {
    const row = modal.locator('tbody tr').filter({ hasText: name }).first();
    if (!(await row.count())) continue;
    const deleteIcon = row.locator('.anticon-delete').first();
    if (await deleteIcon.count()) {
      await deleteIcon.click();
    }
  }
  await closeVariablesList(page);
}

function getFormItemTextarea(container: Locator, label: string) {
  return container.locator('.ant-form-item').filter({ hasText: label }).locator('textarea').first();
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
