import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';
import { fillRelativeTimeRange, fillTriggers, type AlertRuleTrigger } from '../helpers';

/**
 * 填充 gcm（Google Cloud Monitoring）告警规则的条件。
 *
 * GCM AlertRule（builder 模式）包含：
 * - 项目 Select（"项目"，field: project_id，API 加载）
 * - 服务 Select（"服务"，field: service，API 加载）
 * - 指标 Select（"指标"，field: metric_type，API 加载）
 * - 查询区间（RelativeTimeRangePicker，label "查询区间"）
 * - 筛选字段（Filters）
 * - 预处理（"预处理"，Select，field: preprocessor）
 * - 聚合标签（"聚合标签"，tags Select，field: group_bys）
 * - 聚合函数（"聚合函数"，Select，field: reducer）
 * - 对齐函数（"对齐函数"，Select，field: aligner）
 * - 对齐周期（"对齐周期"，InputNumber，field: alignment_period）
 *
 * @see /src/plus/datasource/gcm/AlertRule/Queries/index.tsx
 * @see /src/plus/datasource/gcm/AlertRule/index.tsx
 */

/**
 * 在 GCM Select 中选择选项（force click + fill + Enter）。
 */
async function selectGCMOption(page: Page, label: string, optionValue: string) {
  const combobox = page.locator('.ant-input-group').filter({ hasText: label }).getByRole('combobox').first();
  await combobox.click({ force: true });
  await combobox.fill(optionValue);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for gcm alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: gcm rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as Record<string, unknown>;
  if (item.ref !== 'A') {
    throw new Error(`TODO: gcm rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if ((item.query_type as string) !== 'builder') {
    throw new Error(`TODO: gcm rule_config.queries[0].query_type=${item.query_type} is not supported yet`);
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('页面中已有表单卡片和 QueryName 编辑框');

  // 1. Select project (showSearch)
  const projectId = item.project_id as string | undefined;
  if (!projectId) throw new Error('Missing gcm rule_config.queries[0].project_id');
  await selectGCMOption(page, '项目', projectId);

  // 2. Wait for service to load
  await page.waitForTimeout(1500);

  // 3. Select service (showSearch)
  const service = item.service as string | undefined;
  if (!service) throw new Error('Missing gcm rule_config.queries[0].service');
  await selectGCMOption(page, '服务', service);

  // 4. Wait for metric type to load
  await page.waitForTimeout(1500);

  // 5. Select metric type (showSearch)
  const metricType = item.metric_type as string | undefined;
  if (!metricType) throw new Error('Missing gcm rule_config.queries[0].metric_type');
  await selectGCMOption(page, '指标', metricType);

  await page.waitForTimeout(500);

  // 6. Fill time range (from: 900, to: 0 → "最近 15 分钟")
  await fillRelativeTimeRange(page, item.range as { start: string; end: string } | undefined, 'gcm');

  // 7. Fill group_bys — tags Select (label "聚合标签")
  const groupBys = item.group_bys as string[] | undefined;
  if (groupBys && groupBys.length > 0) {
    for (const groupBy of groupBys) {
      const combobox = page.locator('.ant-input-group').filter({ hasText: '聚合标签' }).getByRole('combobox').first();
      await combobox.click({ force: true });
      await combobox.fill(groupBy);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
  }

  // NOTE: 以下字段由 API metricDescriptor 动态过滤，UI 交互不稳定，跳过 UI 填写。
  // 通过 buildExpectedAlertRule 从 expected payload 中删除这些字段：
  // reducer, aligner, alignment_period, group_bys

  // 11. Fill triggers
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
        throw new Error(`TODO: gcm rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
