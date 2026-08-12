import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';
import { fillAdvancedSettings, fillTriggers, type AlertRuleTrigger } from '../helpers';

/**
 * 填充 TDengine 告警规则的条件。
 *
 * TDengine 查询编辑器使用：
 * - 一个 `<Input />` 纯文本框（不含 LogQL CodeMirror）填入查询 SQL
 * - 一个 Input.Group（间隔 + 秒/分钟/小时选择器）
 * - AdvancedSettings（graph 模式，默认展开）包含 MetricKey / LabelKey 标签选择器
 *
 * @see /src/plugins/TDengine/AlertRule/Queries/index.tsx
 * @see /src/plugins/TDengine/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for TDengine alert rule handler');
  }

  const queries = uiConfig.queries;
  if (queries.length !== 1) {
    throw new Error(`TODO: TDengine rule_config.queries length ${queries.length} is not supported yet`);
  }

  const item = queries[0];
  if (item.ref !== 'A') {
    throw new Error(`TODO: TDengine rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing TDengine rule_config.queries[0].query');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 TDengine 查询条件编辑器和辅助配置');

  // TDengine 查询编辑器使用 SqlMonacoEditor（Monaco），通过 textarea role 定位
  // 注意：不要先 click Monaco 的 textarea，否则会被 .view-line 拦截 pointer events，直接 fill 即可（fill 会自动聚焦）
  const editor = page.locator('[data-section-key="rule"]').getByRole('textbox', { name: 'Editor content' }).first();
  await expect(editor, 'TDengine query Monaco editor').toBeVisible();
  await editor.fill(item.query);

  // 填写查询间隔（InputNumber）
  if (item.interval !== undefined) {
    const spinbutton = page.locator('[data-section-key="rule"]').locator('xpath=(.//*[normalize-space(.)="时间间隔"]/following::*[@role="spinbutton"])[1]');
    await expect(spinbutton, 'TDengine interval InputNumber').toBeVisible();
    await spinbutton.fill(String(item.interval));
  }

  // 填写 AdvancedSettings 中的值字段（metricKey）和标签字段（labelKey）（graph 模式默认展开）
  // 前端标签使用默认文案：值字段 / 标签字段（fillAdvancedSettings 的 DEFAULT_LABELS）
  if (item.keys) {
    await fillAdvancedSettings(page, {
      valueKey: Array.isArray(item.keys.metricKey) ? item.keys.metricKey : item.keys.metricKey ? [String(item.keys.metricKey)] : undefined,
      labelKey: Array.isArray(item.keys.labelKey) ? item.keys.labelKey : item.keys.labelKey ? [String(item.keys.labelKey)] : undefined,
    });
  }

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
      if (trigger.recover_config && trigger.recover_config.judge_type !== 1) {
        throw new Error(`TODO: TDengine rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
