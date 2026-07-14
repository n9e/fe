import { expect, type Page } from '@playwright/test';

import { fillTimePickerInput, setAntFormItemSwitch, selectAntFormItemOption } from '../../helpers';
import type { AiTap, AiWaitFor } from '../../types';
import type { NormalizedAlertRuleConfig, NormalizedTimeRange } from '../types';
import { openFormNgSection } from '../helpers';

const DEFAULT_DAYS = ['0', '1', '2', '3', '4', '5', '6'];

function sameStringArray(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

async function ensureEffectiveTimeRangeCount(page: Page, count: number) {
  const addIcon = page.locator('xpath=(//*[normalize-space(.)="生效时间"])[last()]/following::*[contains(@class,"control-icon-normal")][1]');
  for (let index = 1; index < count; index += 1) {
    const timePickerCount = await page.locator('.ant-picker input:visible').count();
    if (timePickerCount >= (index + 1) * 2) continue;
    await addIcon.click();
  }
}

async function fillEffectiveTimeRange(page: Page, range: NormalizedTimeRange, index: number) {
  if (!sameStringArray(range.daysOfWeek, DEFAULT_DAYS)) {
    const effectiveSection = page.locator('[data-section-key="effective"]');
    const combobox = effectiveSection.locator(`xpath=(.//*[normalize-space(.)="生效时间"]/following::*[@role="combobox"])[${index + 1}]`);
    const selectRoot = combobox.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    const removeButtons = selectRoot.locator('.ant-select-selection-item-remove');
    while ((await removeButtons.count()) > 0) {
      await removeButtons.first().click();
    }

    for (const day of range.daysOfWeek) {
      await combobox.click();
      await combobox.fill(day);
      await page.keyboard.press('Enter');
    }
  }

  const timeInputs = page.locator('.ant-picker input:visible');
  await fillTimePickerInput(timeInputs.nth(index * 2), range.start, `effective start time ${index}`);
  await fillTimePickerInput(timeInputs.nth(index * 2 + 1), range.end, `effective end time ${index}`);
}

async function ensureServiceCalConfigCount(page: Page, count: number) {
  const serviceCalTitle = page.getByText('服务日历', { exact: true }).filter({ visible: true }).last();
  await serviceCalTitle.scrollIntoViewIfNeeded();
  const addIcon = page.getByLabel('plus-circle').filter({ visible: true }).last();
  for (let index = 0; index < count; index += 1) {
    await addIcon.click({ force: true });
  }
}

async function selectServiceCalendar(page: Page, serviceCalName: string, configIndex: number) {
  const effectiveSection = page.locator('[data-section-key="effective"]');
  const combobox = effectiveSection.locator(`xpath=(.//*[normalize-space(.)="服务日历"]/following::*[@role="combobox"])[${configIndex + 1}]`);
  await expect(combobox, `service calendar combobox ${configIndex}`).toBeVisible();
  const selectRoot = combobox.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  await selectRoot.locator('.ant-select-selector').click();
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, `service calendar dropdown ${configIndex}`).toBeVisible();
  const option = dropdown.getByRole('option', { name: serviceCalName }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await expect(selectRoot.locator('.ant-select-selection-item').filter({ hasText: serviceCalName }).first(), `selected service calendar ${serviceCalName}`).toBeVisible();
}

/**
 * 填写生效配置步骤：时区、生效窗口、enable_in_bg。
 *
 * 仅在 uiConfig.effectiveIsDefault 为 false 时执行。
 * 服务日历暂未接入（为 Plus 专属功能），如配置中包含服务日历将跳过。
 */
export async function fillEffectiveStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap, _aiWaitFor: AiWaitFor) {
  if (uiConfig.effectiveIsDefault) {
    return;
  }

  await openFormNgSection(page, 'effective', '生效配置');

  // 填写时区
  if (uiConfig.timeZoneName) {
    await selectAntFormItemOption(aiTap, '时区', uiConfig.timeZoneName);
  }

  if (uiConfig.effectiveTimeRanges.length > 0) {
    await ensureEffectiveTimeRangeCount(page, uiConfig.effectiveTimeRanges.length);
    for (const [index, range] of uiConfig.effectiveTimeRanges.entries()) {
      await fillEffectiveTimeRange(page, range, index);
    }
  }

  await setAntFormItemSwitch(page, '仅在本业务组生效', uiConfig.enableInBg);

  if (uiConfig.serviceCalConfigs.length > 0) {
    await expect(page.getByText('服务日历').first(), 'service calendar field').toBeVisible();
    await ensureServiceCalConfigCount(page, uiConfig.serviceCalConfigs.length);
    for (const [configIndex, serviceCalConfig] of uiConfig.serviceCalConfigs.entries()) {
      for (const serviceCalName of serviceCalConfig.serviceCalNames) {
        await selectServiceCalendar(page, serviceCalName, configIndex);
      }

      const serviceTimeOffset = uiConfig.effectiveTimeRanges.length * 2 + configIndex * 2;
      const timeInputs = page.locator('.ant-picker input:visible');
      await fillTimePickerInput(timeInputs.nth(serviceTimeOffset), serviceCalConfig.timeRange.start, `service calendar start time ${configIndex}`);
      await fillTimePickerInput(timeInputs.nth(serviceTimeOffset + 1), serviceCalConfig.timeRange.end, `service calendar end time ${configIndex}`);
    }
  }
}
