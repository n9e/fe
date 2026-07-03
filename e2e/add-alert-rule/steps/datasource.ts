import { expect, type Page } from '@playwright/test';

import { selectFirstDatasourceFilterValue } from '../helpers';
import type { AiTap } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';

/**
 * 填写数据源筛选步骤：选择数据源类型、匹配方式、数据源值。
 */
export async function fillDatasourceStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap) {
  // 选择数据源类型（cate）
  if (uiConfig.cate !== 'prometheus') {
    await aiTap(uiConfig.cateName);
  }
  await expect(page.getByText(uiConfig.cateName).first()).toBeVisible();

  // 数据源筛选
  const datasourceQuery = uiConfig.datasourceQueries[0];
  await expect(page.getByText(datasourceQuery.matchTypeName).first()).toBeVisible();
  await expect(page.getByText(datasourceQuery.opName).first()).toBeVisible();
  for (const datasourceName of datasourceQuery.datasourceNames) {
    await selectFirstDatasourceFilterValue(page, datasourceName);
  }
}
