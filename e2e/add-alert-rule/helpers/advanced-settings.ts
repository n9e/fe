import { expect, type Locator, type Page } from '@playwright/test';

import { selectAntSelectOption } from '../../helpers';

/**
 * 辅助配置中可被通用处理的字段。
 */
export interface AdvancedSettingsConfig {
  valueKey?: string | string[];
  labelKey?: string | string[];
  timeKey?: string;
  timeFormat?: string;
  unit?: string;
}

/**
 * 各字段在 UI 中的标签文案映射。
 * 默认使用中文。若其他数据源使用不同文案，通过 labelMap 覆盖。
 */
export interface AdvancedSettingsLabelMap {
  valueKey?: string;
  labelKey?: string;
  timeKey?: string;
  timeFormat?: string;
  unit?: string;
}

const DEFAULT_LABELS: Required<AdvancedSettingsLabelMap> = {
  valueKey: '值字段',
  labelKey: '标签字段',
  timeKey: '时间字段',
  timeFormat: '时间格式',
  unit: '单位',
};

/**
 * 在 ant-design tags select 中逐个填入值。
 * 每个值通过 combobox 输入后按 Enter 确认。
 */
async function fillTagsSelect(page: Page, label: string, values: string[]) {
  if (values.length === 0) return;
  const group = page.locator('.ant-input-group').filter({ hasText: label });
  const combobox = group.getByRole('combobox').last();
  await expect(combobox, `${label} tags select`).toBeVisible();
  for (const value of values) {
    await combobox.click();
    await combobox.fill(value);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * 填充辅助配置中的通用字段。
 *
 * 支持的字段（按 UI 标签文案区分）：
 * - 值字段（valueKey）：tags 多选
 * - 标签字段（labelKey）：tags 多选
 * - 时间字段（timeKey）：文本输入
 * - 时间格式（timeFormat）：文本输入
 *
 * 展开面板由各 handler 自行控制。
 */
export async function fillAdvancedSettings(page: Page, config: AdvancedSettingsConfig | undefined, labelMap?: AdvancedSettingsLabelMap) {
  if (!config) return;
  const labels = { ...DEFAULT_LABELS, ...labelMap };

  const valueKeys = toArray(config.valueKey);
  if (valueKeys.length > 0) {
    await fillTagsSelect(page, labels.valueKey, valueKeys);
  }

  const labelKeys = toArray(config.labelKey);
  if (labelKeys.length > 0) {
    await fillTagsSelect(page, labels.labelKey, labelKeys);
  }

  if (config.timeKey) {
    const input = page.locator('.ant-input-group').filter({ hasText: labels.timeKey }).locator('input').last();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(config.timeKey);
    }
  }

  if (config.timeFormat) {
    const input = page.locator('.ant-input-group').filter({ hasText: labels.timeFormat }).locator('input').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(config.timeFormat);
    }
  }

  if (config.unit && config.unit !== 'none') {
    const unitSelect = page.locator('.ant-input-group').filter({ hasText: labels.unit }).getByRole('combobox').first();
    await selectAntSelectOption(page, unitSelect as Locator, config.unit);
  }
}
