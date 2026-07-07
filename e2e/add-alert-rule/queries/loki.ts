import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';

/**
 * 填充 Loki 告警规则的条件。
 *
 * Loki 告警条件包含 LogQL 查询（Ant Design Input）和 Severity 选择。
 * 没有 triggers 部分，因为 Loki 的 severity 直接在查询中配置。
 *
 * @see /src/pages/alertRules/FormNG/Rule/Log/Loki/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiTap, aiAssert, aiWaitFor }) => {
  if (!aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiTap/aiWaitFor fixtures for loki alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: loki rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0];
  if (!item.promQl) {
    throw new Error('Missing loki rule_config.queries[0].prom_ql');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 LogQL 查询条件输入框和告警级别');

  // Fill LogQL Input — 使用 placeholder 定位
  const logqlInput = page.getByPlaceholder('Input logql to query. Press Shift+Enter for newlines');
  await expect(logqlInput, 'Loki LogQL input').toBeVisible({ timeout: 5000 });
  await logqlInput.click();
  await logqlInput.fill(item.promQl);

  // 验证 severity 处于选中状态
  if (item.severityName && aiAssert) {
    await aiAssert(`二级报警（Warning）单选框处于选中状态`);
  }
};

export default query;
