import { expect, type Page } from '@playwright/test';

import type { NormalizedAlertRuleConfig } from '../types';

export * from './fill-trigger';
export * from './range';
export * from './advanced-settings';

export async function openFormNgSection(page: Page, sectionKey: string, sectionTitle: string) {
  const section = page.locator(`[data-section-key="${sectionKey}"]`);
  await expect(section, `${sectionTitle} section`).toBeAttached();

  const sidebar = page.locator('aside');
  if (!(await sidebar.isVisible().catch(() => false))) {
    const expandSidebarButton = page.getByRole('button', { name: /展开侧边栏|Expand sidebar/i });
    if (await expandSidebarButton.isVisible().catch(() => false)) {
      await expandSidebarButton.click();
      await expect(sidebar, 'FormNG sidebar').toBeVisible();
    }
  }

  const sidebarButton = sidebar.getByRole('button').filter({ hasText: sectionTitle }).first();
  if (await sidebarButton.isVisible().catch(() => false)) {
    await sidebarButton.click();
  } else {
    await section.scrollIntoViewIfNeeded();
  }

  const header = section.locator('xpath=./div/div[1]');
  const content = section.locator('xpath=./div/div[2]');
  await expect(header, `${sectionTitle} section header`).toBeVisible();

  if (!(await content.isVisible().catch(() => false))) {
    await header.click();
    await expect(content, `${sectionTitle} section content`).toBeVisible();
  }

  await section.scrollIntoViewIfNeeded();
  return section;
}

export async function fillIntervalAndDuration(page: Page, uiConfig: NormalizedAlertRuleConfig) {
  const ruleSection = page.locator('[data-section-key="rule"]');

  const cronPattern = ruleSection
    .locator('.ant-form-item')
    .filter({
      has: page.locator('label').filter({ hasText: '执行频率' }),
    })
    .getByRole('combobox')
    .last();
  await expect(cronPattern, '执行频率下拉选择框').toBeVisible();
  await cronPattern.click();
  await cronPattern.fill(uiConfig.cronPattern);
  await page.keyboard.press('Enter');

  const durationInput = ruleSection
    .locator('.ant-form-item')
    .filter({
      has: page.locator('label').filter({ hasText: '持续时长 (s)' }),
    })
    .locator('input:not([type="hidden"]), textarea')
    .last();
  await expect(durationInput, '持续时长 input').toBeVisible();
  await durationInput.fill(String(uiConfig.promForDuration));
}

export async function selectNotificationRuleFromDropdown(page: Page, ruleName: string) {
  const notifySection = page.locator('[data-section-key="notify"]');
  await notifySection.getByRole('button', { name: /选择通知规则|Select notification rule/ }).click();

  const dropdown = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)').last();
  await expect(dropdown, `notification rule dropdown for ${ruleName}`).toBeVisible();

  const searchInput = dropdown.getByRole('textbox').first();
  await expect(searchInput, 'notification rule search input').toBeVisible();
  await searchInput.fill(ruleName);

  const ruleItem = dropdown.locator('.cursor-pointer').filter({ hasText: ruleName }).first();
  await expect(ruleItem, `notification rule option ${ruleName}`).toBeVisible();
  await ruleItem.click();

  await expect(notifySection.getByText(ruleName, { exact: true }).first(), `selected notification rule ${ruleName}`).toBeVisible();
  if (await dropdown.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
  }
}
