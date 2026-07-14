import { expect, type Page, Locator } from '@playwright/test';

import type { NormalizedAlertRuleConfig } from '../types';

/**
 * 在 n9e-db-cate-grid 中找到指定标签的 grid item 并点击。
 * 使用 Playwright 定位器替代 Midscene aiTap，因为 grid item 的 onClick 挂在父级 div 上，
 * aiTap 点击内层文本元素时事件冒泡可能未触发 React 的 onChange。
 */
async function selectDatasourceCate(page: Page, cateName: string) {
  const gridItem = page.locator('.n9e-db-cate-grid-item').filter({ hasText: cateName });
  await expect(gridItem.first(), `datasource cate grid item "${cateName}"`).toBeVisible({ timeout: 5000 });
  await gridItem.first().click();
}

/**
 * 操作 antd Select multiple/mode 多选下拉选择器，选中指定选项。
 * 选中后自动关闭下拉菜单，并验证选项已显示为标签（`.ant-select-selection-item`）。
 */
export async function selectAntSelectMultipleOption(page: Page, select: Locator, optionText: string) {
  const selectRoot = select.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  await selectRoot.locator('.ant-select-selector').first().click();

  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, `dropdown for option ${optionText}`).toBeVisible();

  const exactOptionText = new RegExp(`^${optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  const option = dropdown.getByRole('option', { name: exactOptionText }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await dropdown.locator('.ant-select-item-option-content').filter({ hasText: exactOptionText }).first().click();
  }

  if (await dropdown.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
  }
  await expect(selectRoot.locator('.ant-select-selection-item').filter({ hasText: exactOptionText }).first(), `selected option ${optionText}`).toBeVisible();
}

export async function fillDatasourceStep(page: Page, uiConfig: NormalizedAlertRuleConfig) {
  // 选择数据源类型（cate），Prometheus 是默认值无需切换
  if (uiConfig.cate !== 'prometheus') {
    await selectDatasourceCate(page, uiConfig.cateName);
  }
  await expect(page.getByText(uiConfig.cateName).first()).toBeVisible();

  // 数据源筛选 — match type, op, datasource values
  const datasourceQuery = uiConfig.datasourceQueries[0];
  await expect(page.getByText(datasourceQuery.matchTypeName).first()).toBeVisible();
  await expect(page.getByText(datasourceQuery.opName).first()).toBeVisible();
  for (const datasourceName of datasourceQuery.datasourceNames) {
    const datasourceValuesSelect = page.locator('[data-section-key="datasource"] .ant-select-multiple').first();
    await expect(datasourceValuesSelect, 'datasource values select').toBeVisible();
    await selectAntSelectMultipleOption(page, datasourceValuesSelect, datasourceName);
  }
}
