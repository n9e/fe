import { expect, type Page } from '@playwright/test';

import { fillTextInputByIndex } from '../../helpers';
import type { AiTap } from '../../types';
import type { AlertRuleConditionHandler } from '../types';

async function addQueryIfNeeded(page: Page, queryIndex: number, aiTap: AiTap) {
  if (queryIndex === 0) return;
  await aiTap('添加查询条件');
  await page.waitForTimeout(300);
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiTap }) => {
  if (!aiTap) {
    throw new Error('Missing Midscene aiTap fixture for loki alert rule handler');
  }

  for (let index = 0; index < uiConfig.queries.length; index++) {
    const item = uiConfig.queries[index];
    await addQueryIfNeeded(page, index, aiTap);

    if (!item.promQl) {
      throw new Error(`Missing rule_config.queries[${index}].prom_ql for loki alert rule`);
    }

    await fillTextInputByIndex(page, index, item.promQl, `loki query input for query index ${index}`);

    if (item.severityName) {
      await expect(page.getByRole('radio', { name: item.severityName }).nth(index)).toBeChecked();
    }
  }
};

export default query;
