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

  // Fill LogQL Input — Loki 使用 LokiMonacoEditor（Monaco），通过 textarea role 定位
  // 注意：不要先 click Monaco 的 textarea，否则会被 .view-line 拦截 pointer events，直接 fill 即可（fill 会自动聚焦）
  const logqlInput = page.locator('[data-section-key="rule"]').getByRole('textbox', { name: 'Editor content' }).first();
  await expect(logqlInput, 'Loki LogQL Monaco editor').toBeVisible({ timeout: 5000 });
  await logqlInput.fill(item.promQl);

  // 验证 severity 处于选中状态
  if (item.severityName && aiAssert) {
    await aiAssert(`二级告警（Warning）单选框处于选中状态`);
  }
};

export default query;
