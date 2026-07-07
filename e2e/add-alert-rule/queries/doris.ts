import { expect } from '@playwright/test';

import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillTriggers, type AlertRuleTrigger } from '../helpers';

interface DorisQuery extends NormalizedQuery {
  sql?: string;
  interval?: number;
  interval_unit?: string;
  keys?: {
    labelKey?: string | string[];
    valueKey?: string | string[];
  };
  unit?: string;
  offset?: number;
}

/**
 * 填充 Doris 告警规则的条件。
 *
 * Doris 告警条件包含 SQL 查询（Monaco 编辑器）、执行间隔和辅助配置（值字段/标签字段/偏移量）。
 * AdvancedSettings 默认是展开的，用 Ant Design tags Select 填写值字段和标签字段。
 *
 * @see /src/plugins/doris/AlertRule/index.tsx
 * @see /src/plugins/doris/AlertRule/Query.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for doris alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: doris rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as DorisQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: doris rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.sql) {
    throw new Error('Missing doris rule_config.queries[0].sql');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 Doris 查询条件编辑器和辅助配置');

  // 填充 SQL 查询 (Monaco 编辑器)
  // SqlMonacoEditor 使用 react-monaco-editor, 渲染为 .monaco-editor 容器
  const sqlGroup = page.locator('.ant-input-group').filter({ hasText: 'SQL' });
  const monacoEditor = sqlGroup.locator('.monaco-editor').first();
  await expect(monacoEditor, 'doris SQL Monaco 编辑器').toBeVisible();
  await monacoEditor.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.type(item.sql);

  // 填充执行间隔 (InputNumber + Select)
  const intervalRow = page.locator('div.ant-input-group').filter({ hasText: '间隔' });
  if (item.interval !== undefined) {
    const intervalInput = intervalRow.locator('.ant-input-number-input[role="spinbutton"]');
    if (await intervalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intervalInput.click();
      await intervalInput.fill(String(item.interval));
    }
  }

  // 填充辅助配置 — valueKey (必填), labelKey, unit, offset
  // AdvancedSettings 总是展开的 (expanded={true})
  // unit = 'none' 时不填充 (fillAdvancedSettings 内部已跳过)
  // offset 默认值为 0，config 值也为 0，无需填充
  const needsAdvanced = Boolean(item.keys?.valueKey || item.keys?.labelKey || (item.unit && item.unit !== 'none'));
  if (needsAdvanced) {
    await fillAdvancedSettings(page, { ...item.keys, unit: item.unit });
  }

  // 填充阈值判断 (builder 模式)
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
        throw new Error(`TODO: doris rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
