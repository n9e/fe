import { expect, type Page } from '@playwright/test';

import { fillAntFormItemInput, selectAntOption, selectAntSelectMultipleOption } from '../../helpers';
import type { AiTap } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';

export * from './fill-trigger';

export async function fillIntervalAndDuration(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap) {
  await selectAntOption(aiTap, '执行频率下拉选择框', uiConfig.cronPattern);
  await fillAntFormItemInput(page, '持续时长 (s)', String(uiConfig.promForDuration));
}

/**
 * 在数据源筛选组中找到匹配 label 的选项并选择。
 */
export async function selectFirstDatasourceFilterValue(page: Page, datasourceName: string) {
  const datasourceValuesSelect = page.locator('[data-section-key="datasource"] .ant-select-multiple').first();
  await expect(datasourceValuesSelect, 'datasource values select').toBeVisible();
  await selectAntSelectMultipleOption(page, datasourceValuesSelect, datasourceName);
}
