import { expect } from '@playwright/test';

import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillTriggers } from '../helpers';

interface IotDBQuery extends NormalizedQuery {
  query?: string;
  keys?: {
    labelKey?: string | string[];
    metricKey?: string | string[];
    timeKey?: string;
  };
}

/**
 * 填充 IoTDB 告警规则的条件。
 *
 * IoTDB 告警条件包含 SQL 查询（普通 Input 组件）、时间间隔、辅助配置和阈值判断。
 *
 * @see /src/plugins/iotdb/AlertRule/Queries/index.tsx
 * @see /src/plugins/iotdb/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for IoTDB alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: IoTDB rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as IotDBQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: IoTDB rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing IoTDB rule_config.queries[0].query');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 IoTDB 查询条件编辑器和辅助配置');

  const editor = page.locator('.iotdb-alert-rule-query input').first();
  await expect(editor, 'IoTDB query input').toBeVisible();
  await editor.click();
  await editor.fill(item.query);

  if (item.interval !== undefined) {
    const spinbutton = page.locator('[data-section-key="rule"]').locator('xpath=(.//*[normalize-space(.)="时间间隔"]/following::*[@role="spinbutton"])[1]');
    await expect(spinbutton, 'IoTDB interval InputNumber').toBeVisible();
    await spinbutton.fill(String(item.interval));
  }

  await fillAdvancedSettings(
    page,
    {
      valueKey: item.keys?.metricKey,
      labelKey: item.keys?.labelKey,
      timeKey: item.keys?.timeKey,
    },
    {
      valueKey: '值字段',
      labelKey: '标签字段',
      timeKey: '时间字段',
    },
  );

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
