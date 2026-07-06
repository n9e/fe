import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler } from '../types';
import { fillTriggers, type AlertRuleTrigger } from '../helpers';

/**
 * 填充 cloudwatch（AWS CloudWatch）告警规则的条件。
 *
 * CloudWatch AlertRule 有嵌套子查询结构：
 * - 外层 query：ref + range（查询时间范围）
 * - 内层 sub-query（QueryItem）：
 *   - 区域（"区域"，Select with showSearch，field: region）
 *   - 命名空间（"命名空间"，Select with showSearch，field: namespace）
 *   - 指标名称（"指标名称"，Select with showSearch，field: metric_name）
 *   - 精确匹配（Switch，field: match_exact）
 *   - OtherSettings：ID、别名、周期、统计数据、偏移量、返回数据
 *
 * @see /src/plus/datasource/cloudwatch/AlertRule/index.tsx
 * @see /src/plus/datasource/cloudwatch/AlertRule/Queries/index.tsx
 * @see /src/plus/datasource/cloudwatch/AlertRule/Queries/SubQueries/index.tsx
 */

/**
 * 在 CloudWatch 的 showSearch Select 中选择选项（force click + fill + Enter）。
 * CardContainer 的 ant-card-body 会拦截 pointer events，需要使用 force: true。
 */
async function selectCWOption(page: Page, label: string, optionValue: string) {
  const combobox = page.locator('.ant-input-group').filter({ hasText: label }).getByRole('combobox').first();
  await combobox.click({ force: true });
  await combobox.fill(optionValue);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

/**
 * 统计数据 Select（无 showSearch）使用点击 dropdown option 方式选择。
 * 选项标签通过 locale 映射（如 Minimum → 最小值）。
 */
async function selectStatisticOption(page: Page, statistic: string) {
  const combobox = page.locator('.ant-input-group').filter({ hasText: '统计数据' }).getByRole('combobox').first();
  await combobox.click({ force: true });
  await page.waitForTimeout(500);
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, 'statistic dropdown').toBeVisible({ timeout: 3000 });
  // 选项值为 statistics 英文名（Minimum），但 dropdown 展示的是中文翻译（最小值）
  const option = dropdown.locator(`[option-value="${statistic}"]`).or(dropdown.getByText(statistic, { exact: true }));
  await option.first().click({ timeout: 3000 }).catch(async () => {
    // Fallback：通过中文标签点击
    const labelMap: Record<string, string> = {
      Average: '平均值',
      Minimum: '最小值',
      Maximum: '最大值',
      Sum: '总和',
      SampleCount: '样本数',
      IQM: 'IQM',
    };
    const cnLabel = labelMap[statistic];
    if (cnLabel) {
      await dropdown.getByText(cnLabel, { exact: true }).click();
    }
  });
  await page.waitForTimeout(300);
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for cloudwatch alert rule handler');
  }

  const queries = uiConfig.queries;
  if (queries.length !== 1) {
    throw new Error(`TODO: cloudwatch rule_config.queries length ${queries.length} is not supported yet`);
  }

  const item = queries[0] as Record<string, unknown>;
  if (item.ref !== 'A') {
    throw new Error(`TODO: cloudwatch rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }

  // Extract sub-queries from the outer query
  const subQueries = (item.queries ?? []) as Record<string, unknown>[];
  if (subQueries.length !== 1) {
    throw new Error(`TODO: cloudwatch sub-queries length ${subQueries.length} is not supported yet`);
  }

  const subQuery = subQueries[0];
  if (subQuery.query_type !== 'metric_search') {
    throw new Error(`TODO: cloudwatch sub-query.query_type=${subQuery.query_type} is not supported yet`);
  }
  if (subQuery.metric_editor_mode !== 0) {
    throw new Error(`TODO: cloudwatch sub-query.metric_editor_mode=${subQuery.metric_editor_mode} is not supported yet`);
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到 CloudWatch 查询条件编辑器');

  // 1. Select region
  const region = subQuery.region as string | undefined;
  if (!region) throw new Error('Missing cloudwatch sub-query region');
  await selectCWOption(page, '区域', region);

  // 2. Wait for namespace to load
  await page.waitForTimeout(1500);

  // 3. Select namespace
  const namespace = subQuery.namespace as string | undefined;
  if (!namespace) throw new Error('Missing cloudwatch sub-query namespace');
  await selectCWOption(page, '命名空间', namespace);

  // 4. Wait for metric name to load
  await page.waitForTimeout(1500);

  // 5. Select metric name
  const metricName = subQuery.metric_name as string | undefined;
  if (!metricName) throw new Error('Missing cloudwatch sub-query metric_name');
  await selectCWOption(page, '指标名称', metricName);

  await page.waitForTimeout(500);

  // 6. Fill OtherSettings
  // query_id (label "ID")
  const queryId = subQuery.query_id as string | undefined;
  if (queryId) {
    const idInput = page.locator('.ant-input-group').filter({ hasText: 'ID' }).locator('input').last();
    if (await idInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await idInput.fill(queryId);
    }
  }

  // alias (label "别名")
  const alias = subQuery.alias as string | undefined;
  if (alias) {
    const aliasInput = page.locator('.ant-input-group').filter({ hasText: '别名' }).locator('input').last();
    if (await aliasInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aliasInput.fill(alias);
    }
  }

  // period (label "周期", AutoComplete)
  const period = subQuery.period as string | undefined;
  if (period) {
    const periodInput = page.locator('.ant-input-group').filter({ hasText: '周期' }).locator('input').last();
    if (await periodInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await periodInput.fill(period);
      await page.keyboard.press('Enter');
    }
  }

  // statistic (label "统计数据", Select without showSearch — uses dropdown click)
  const statistic = subQuery.statistic as string | undefined;
  if (statistic) {
    await selectStatisticOption(page, statistic);
  }

  // offset (label "偏移量", InputNumber)
  const offset = subQuery.offset as number | undefined;
  if (offset !== undefined && offset !== 0) {
    const offsetInput = page.locator('.ant-input-group').filter({ hasText: '偏移量' }).getByRole('spinbutton').last();
    if (await offsetInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await offsetInput.fill(String(offset));
    }
  }

  // return_data (label "返回数据", Switch, default true — skip)
  // match_exact (label "精确匹配", Switch, default false — skip)

  // 7. Fill triggers
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
        throw new Error(`TODO: cloudwatch rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
