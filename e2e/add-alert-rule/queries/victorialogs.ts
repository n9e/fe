import { expect } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';
import { fillTriggers, type AlertRuleTrigger } from '../helpers';

/**
 * 填充 VictoriaLogs 告警规则的条件。
 *
 * VictoriaLogs 使用：
 * - 一个 `<Input.TextArea />` 纯文本框（对应 `DEFAULT_QUERY: '_time: 1m | '`）
 * - 无 AdvancedSettings、无时间区间选择器
 * - 标准 Triggers 组件
 *
 * @see /src/plugins/victorialogs/AlertRule/Queries/index.tsx
 * @see /src/plugins/victorialogs/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for victorialogs alert rule handler');
  }

  const queries = uiConfig.queries;
  if (queries.length !== 1) {
    throw new Error(`TODO: victorialogs rule_config.queries length ${queries.length} is not supported yet`);
  }

  const item = queries[0];
  if (item.ref !== 'A') {
    throw new Error(`TODO: victorialogs rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing victorialogs rule_config.queries[0].query');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 VictoriaLogs 查询条件编辑器和阈值判断区域');

  // VictoriaLogs 使用 <Input.TextArea />（非 CodeMirror），在 .tdengine-discover-query 中
  const textarea = page.locator('.tdengine-discover-query textarea').first();
  await expect(textarea, 'victorialogs query textarea').toBeVisible();
  await textarea.click();
  // 清空并填入完整查询，覆盖 DEFAULT_QUERY 中的初始值
  await textarea.fill(item.query);

  // 填充 builder 模式（mode === 0）的阈值判断
  await fillTriggers(page, uiConfig, aiTap, {
    descriptions: {
      scrollDescription: '向下滚动到告警条件的阈值判断区域',
      waitForDescription: '可以看到告警条件区域中的简单模式、比较符下拉框和阈值数值输入框',
      comparisonFieldDescription: '简单模式中的比较符下拉框',
      valueFieldDescription: '简单模式中的阈值数值输入框',
    },
    aiAssert,
    aiScroll,
    aiWaitFor,
    postTriggerCheck: (trigger: AlertRuleTrigger) => {
      if (trigger.recover_config && trigger.recover_config.judge_type !== 0) {
        throw new Error(`TODO: victorialogs rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
