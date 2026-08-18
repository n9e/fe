import { expect } from '@playwright/test';

import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillTriggers } from '../helpers';

interface InfluxDBQuery extends NormalizedQuery {
  sql?: string;
  keys?: {
    labelKey?: string | string[];
    valueKey?: string | string[];
  };
}

/**
 * 填充 InfluxDB 告警规则的条件。
 *
 * InfluxDB 告警条件包含 SQL 查询（普通 Input 组件）和阈值判断。
 * AdvancedSettings（值字段/标签字段）默认是展开的，用 Ant Design tags Select 填写。
 *
 * @see /src/plus/datasource/influxDB/AlertRule/Queries/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for influxDB alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: influxDB rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as InfluxDBQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: influxDB rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.sql) {
    throw new Error('Missing influxDB rule_config.queries[0].sql');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 InfluxDB 查询条件编辑器和辅助配置');

  // Fill the SQL query in the Monaco editor (SqlMonacoEditor)
  // 注意：不要先 click Monaco 的 textarea，否则会被 .view-line 拦截 pointer events，直接 fill 即可（fill 会自动聚焦）
  const sqlInput = page.locator('[data-section-key="rule"]').getByRole('textbox', { name: 'Editor content' }).first();
  await expect(sqlInput, 'InfluxDB SQL Monaco editor').toBeVisible();
  await sqlInput.fill(item.sql);

  // Fill keys in Advanced Settings (always expanded for influxDB)
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
  });
};

export default query;
