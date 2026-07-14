import { type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';
import { getAlertRuleConditionHandler } from '../queries';
import { fillIntervalAndDuration } from '../helpers';

/**
 * 填写告警条件步骤：触发告警条件处理 + 执行频率和持续时长。
 */
export async function fillRuleStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiAssert?: AiAssert, aiScroll?: AiScroll, aiTap?: AiTap, aiWaitFor?: AiWaitFor) {
  const handleAlertRuleCondition = getAlertRuleConditionHandler(uiConfig.queryHandlerKey);
  await handleAlertRuleCondition({ page, uiConfig, aiAssert, aiTap, aiScroll, aiWaitFor });

  // 执行频率和持续时长
  await fillIntervalAndDuration(page, uiConfig);
}
