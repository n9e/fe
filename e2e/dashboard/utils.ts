import { expect, type Page, type Locator } from '@playwright/test';

import getBaseURL from '../utils/getBaseURL';
import { selectOptionClick } from '../utils/antdUtils';

const baseURL = getBaseURL();
const dashboardId = 794;
const dashboardURL = `${baseURL}/dashboards/${dashboardId}`;

export async function openDashboard(page: Page) {
  await page.goto(dashboardURL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-detail-container', { timeout: 120_000 });
}

export async function openVariablesList(page: Page) {
  await page.locator('.dashboard-detail-container a').filter({ hasText: '添加变量' }).first().click();
  await expect(getVariablesListModal(page)).toBeVisible();
}

export async function closeVariablesList(page: Page) {
  const modal = getVariablesListModal(page);
  await modal.locator('.ant-modal-close').click();
  await expect(modal).toBeHidden();
}

export async function openAddVariableModal(page: Page) {
  const listModal = getVariablesListModal(page);
  await listModal.locator('.ant-table-footer .ant-btn-primary').click();
  await expect(getAddVariableModal(page)).toBeVisible();
}

function getVariablesListModal(page: Page) {
  return page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '变量列表' }),
  });
}

function getAddVariableModal(page: Page) {
  return page.locator('.ant-modal-wrap:visible .ant-modal').filter({
    has: page.locator('.ant-modal-title', { hasText: '添加变量' }),
  });
}

export function getVariableGroup(page: Page, label: string) {
  return page.locator('.input-group-with-form-item').filter({
    has: page.locator('.input-group-with-form-item-label', { hasText: label }),
  });
}

export async function selectFirstQueryOption(page: Page, group: Locator) {
  await group.locator('.ant-select-selector').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown).toBeVisible({ timeout: 10_000 });
  const option = dropdown.locator('.ant-select-item-option').first();
  await expect(option).toBeVisible();
  const text = (await option.textContent())?.trim() || '';
  await option.click();
  return text;
}

export async function selectSpecificOrFirstQueryOption(page: Page, group: Locator, preferredValue: string) {
  const currentValue = (await group.locator('.ant-select-selection-item').first().textContent())?.trim() || '';
  if (currentValue === preferredValue) return preferredValue;
  await group.locator('.ant-select-selector').click();
  const visibleDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(visibleDropdown).toBeVisible({ timeout: 10_000 });
  const exactOption = visibleDropdown.locator('.ant-select-item-option').filter({ hasText: preferredValue }).first();
  if (await exactOption.count()) {
    await expect(exactOption).toBeVisible();
    await exactOption.first().click();
    return preferredValue;
  }
  const firstOption = visibleDropdown.locator('.ant-select-item-option').first();
  const text = (await firstOption.textContent())?.trim() || '';
  await firstOption.click();
  return text;
}

export async function cleanupDashboardState(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-detail-container', { timeout: 120_000 });
}

async function chooseVariableType(page: Page, modal: Locator, visibleText: string) {
  const formItem = modal
    .locator('.ant-form-item-label > label[title="变量类型"]')
    .first()
    .locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item ")][1]');
  const selector = formItem.locator('.ant-select-selector');
  await expect(selector, '未找到“变量类型”下拉框').toBeVisible({ timeout: 3000 });
  await selector.dispatchEvent('mousedown');
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  await expect(dropdown, '点击“变量类型”后未出现下拉菜单').toBeVisible({ timeout: 3000 });
  await dropdown.getByText(visibleText, { exact: true }).click();
}

function getFormItemTextarea(container: Locator, label: string) {
  return container.locator('.ant-form-item').filter({ hasText: label }).locator('textarea').first();
}

export async function addTextPanel(
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
  await editorModal.locator('.ant-modal-footer > button.ant-btn.ant-btn-primary').click();
  await expect(editorModal).toBeHidden();
  await expect(page.getByText(options.title, { exact: true }).first()).toBeVisible();
}

export async function createQueryVariable(
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

  const datasourceSelect = modal.getByLabel('数据源');
  await selectOptionClick(page, datasourceSelect, options.datasourceName);

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

export async function createCustomVariable(
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
