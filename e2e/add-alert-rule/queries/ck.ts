import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillTriggers, type AlertRuleTrigger } from '../helpers';

interface CKQuery extends NormalizedQuery {
  sql?: string;
  keys?: {
    labelKey?: string | string[];
    valueKey?: string | string[];
  };
}

/**
 * 填充 CK (ClickHouse) 告警规则的条件。
 *
 * CK 告警条件包含 SQL 查询（LogQL CodeMirror 编辑器）和阈值判断。
 * AdvancedSettings（值字段/标签字段）默认是展开的，用 Ant Design tags Select 填写。
 *
 * @see /src/plugins/clickHouse/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for CK alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: CK rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as CKQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: CK rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.sql) {
    throw new Error('Missing CK rule_config.queries[0].sql');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 ClickHouse 查询条件编辑器和辅助配置');

  // Fill the SQL query in the LogQL CodeMirror editor
  // The LogQL component renders in a <div class="ant-input logql-codemirror"><div class="input-content"><div class="cm-content" contenteditable="true">
  const editor = page.locator('.logql-codemirror .cm-content').first();
  await expect(editor, 'CK SQL query CodeMirror editor').toBeVisible();
  await editor.click();
  await editor.fill(item.sql);

  // Fill keys in Advanced Settings (always expanded for CK)
  await fillAdvancedSettings(page, item.keys);

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
        throw new Error(`TODO: CK rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
