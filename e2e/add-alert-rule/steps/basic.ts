import { type Page } from '@playwright/test';

import { fillAntFormItemInput, fillAntFormItemTags, selectAntOption } from '../../helpers';
import type { AiTap } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';

/**
 * 填写基础配置步骤：规则名称、业务组、备注、附加标签。
 */
export async function fillBasicStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap) {
  // 规则名称
  await fillAntFormItemInput(page, '规则名称', uiConfig.name);

  // 业务组
  if (
    !(await page
      .getByText(uiConfig.groupName)
      .isVisible()
      .catch(() => false))
  ) {
    await selectAntOption(aiTap, '业务组下拉选择框', uiConfig.groupName);
  }

  // 备注
  if (uiConfig.note) {
    await fillAntFormItemInput(page, '备注', uiConfig.note);
  }

  if (uiConfig.appendTagStrings.length > 0) {
    await fillAntFormItemTags(page, '附加标签', uiConfig.appendTagStrings);
  }
}
