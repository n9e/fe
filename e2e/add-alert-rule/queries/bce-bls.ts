import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';
import { fillAdvancedSettings, fillRelativeTimeRange, fillTriggers, type AlertRuleTrigger } from '../helpers';

/**
 * 填充 bce-bls（百度云 BLS）告警规则的条件。
 *
 * BCE BLS 条件编辑器包含：
 * - 日志组选择（"日志组"，select，field: project）
 * - 日志集选择（"日志集"，select，field: logstore）
 * - 日志流选择（"日志流"，select，field: logstream）
 * - 查询区间（RelativeTimeRangePicker，label "查询区间"）
 * - 查询条件（<Input.TextArea />，label "查询条件"）
 * - AdvancedSettings（默认展开）包含值字段、标签字段、时间字段
 * - 标准 Triggers 组件
 *
 * project / logstore / logstream 存储的是 NAME（非 UUID），可直接按名称选择。
 * 由于卡片容器 overflow / pointer-events 限制，使用 force click 方式打开 Select。
 *
 * @see /src/plus/datasource/bceBLS/AlertRule/Queries/index.tsx
 * @see /src/plus/datasource/bceBLS/AlertRule/index.tsx
 */

/**
 * 在 BCE BLS 的 showSearch Select 中选择选项（force click + fill + Enter 方式）。
 * CardContainer 的 ant-card-body 会拦截 pointer events，需要使用 force: true。
 */
async function selectBLSSelectOption(page: Page, label: string, optionText: string) {
  const combobox = page.locator('.ant-input-group').filter({ hasText: label }).getByRole('combobox').first();
  await combobox.click({ force: true });
  await combobox.fill(optionText);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for bce-bls alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: bce-bls rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as Record<string, unknown>;
  if (item.ref !== 'A') {
    throw new Error(`TODO: bce-bls rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing bce-bls rule_config.queries[0].query');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到日志组、日志集、日志流和查询条件编辑器');

  // Select project by name
  const projectName = item.project as string | undefined;
  if (!projectName) {
    throw new Error('Missing bce-bls rule_config.queries[0].project');
  }
  await selectBLSSelectOption(page, '日志组', projectName);

  // Wait for logstore options to load
  await page.waitForTimeout(1500);

  // Select logstore by name
  const logstoreName = item.logstore as string | undefined;
  if (!logstoreName) {
    throw new Error('Missing bce-bls rule_config.queries[0].logstore');
  }
  await selectBLSSelectOption(page, '日志集', logstoreName);

  // Wait for logstream options to load
  await page.waitForTimeout(1500);

  // Select logstream by name
  const logstreamName = item.logstream as string | undefined;
  if (!logstreamName) {
    throw new Error('Missing bce-bls rule_config.queries[0].logstream');
  }
  await selectBLSSelectOption(page, '日志流', logstreamName);

  // Fill time range
  await fillRelativeTimeRange(page, item.range as { start: string; end: string } | undefined, 'bce-bls');

  // Fill the query in the textarea (BCE BLS uses <Input.TextArea />, not CodeMirror)
  const textarea = page.locator('.ant-input-group').filter({ hasText: '查询条件' }).locator('textarea').first();
  await expect(textarea, 'bce-bls query textarea').toBeVisible();
  await textarea.click();
  await textarea.fill(item.query as string);

  // Fill Advanced Settings (expanded by default)
  await fillAdvancedSettings(page, item.keys as Record<string, unknown> | undefined);

  // Fill triggers using standard builder-mode (mode === 0) AI interaction
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
        throw new Error(`TODO: bce-bls rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
