import { expect, type Page } from '@playwright/test';

import { BASE_URL, doLogin } from '../../fixture';
import { selectAntSelectOption } from '../../helpers';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillRelativeTimeRange, fillTriggers, type AlertRuleTrigger } from '../helpers';

interface LogsetItem {
  LogsetId: string;
  LogsetName: string;
}

interface TopicItem {
  TopicId: string;
  TopicName: string;
}

interface CLSQuery extends NormalizedQuery {
  query?: string;
  logset_id?: string;
  topic_id?: string;
  range?: {
    start: string;
    end: string;
    display?: string;
  };
  keys?: {
    labelKey?: string | string[];
    timeKey?: string;
    valueKey?: string | string[];
  };
  unit?: string;
}

/**
 * Fetch CLS logset data and resolve logset_id → LogsetName.
 */
async function resolveCLSLogsetName(page: Page, datasourceId: number, logsetId: string): Promise<string | undefined> {
  const { access_token } = await doLogin(page);
  const resp = await page.request.post(`${BASE_URL}/api/n9e-plus/cls-logset`, {
    headers: { Authorization: `Bearer ${access_token}` },
    data: { cate: 'tencent-cls', datasource_id: datasourceId },
  });
  if (!resp.ok()) return undefined;
  const data = await resp.json();
  const list: LogsetItem[] = Array.isArray(data?.dat) ? data.dat : Array.isArray(data) ? data : [];
  return list.find((item) => item.LogsetId === logsetId)?.LogsetName;
}

/**
 * Fetch CLS topic data and resolve topic_id → TopicName.
 */
async function resolveCLSTopicName(page: Page, datasourceId: number, logsetId: string, topicId: string): Promise<string | undefined> {
  const { access_token } = await doLogin(page);
  const resp = await page.request.post(`${BASE_URL}/api/n9e-plus/cls-topic`, {
    headers: { Authorization: `Bearer ${access_token}` },
    data: { cate: 'tencent-cls', datasource_id: datasourceId, logset_id: logsetId },
  });
  if (!resp.ok()) return undefined;
  const data = await resp.json();
  const list: TopicItem[] = Array.isArray(data?.dat) ? data.dat : Array.isArray(data) ? data : [];
  return list.find((item) => item.TopicId === topicId)?.TopicName;
}

/**
 * 填充 tencent-cls (腾讯云 CLS) 告警规则的条件。
 *
 * 通过调用 CLS API 实时解析 logset_id/topic_id (UUID) 为用户可见的 LogsetName/TopicName，
 * 再通过 Ant Design Select 按 label 文本选择选项。
 *
 * @see /src/plus/datasource/tencentCLS/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for tencent-cls alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: tencent-cls rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as CLSQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: tencent-cls rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing tencent-cls rule_config.queries[0].query');
  }
  if (!item.logset_id) {
    throw new Error('Missing tencent-cls rule_config.queries[0].logset_id');
  }
  if (!item.topic_id) {
    throw new Error('Missing tencent-cls rule_config.queries[0].topic_id');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到日志集、日志主题、查询区间和查询条件');

  // Read datasource ID from the already-normalized config
  const datasourceIds = uiConfig.datasourceQueries[0]?.datasourceIds;
  if (!datasourceIds || datasourceIds.length === 0) {
    throw new Error('Missing datasource_ids for tencent-cls in the config');
  }
  const datasourceId = datasourceIds[0];

  const logsetName = await resolveCLSLogsetName(page, datasourceId, item.logset_id);
  if (!logsetName) {
    throw new Error(`Cannot resolve logset name for logset_id=${item.logset_id}`);
  }

  // Select logset by display name
  await selectAntSelectOption(page, page.locator('.ant-input-group').filter({ hasText: '日志集' }).getByRole('combobox').first(), logsetName);

  // Wait for topic options to load (depends on logset selection)
  await page.waitForTimeout(1000);

  const topicName = await resolveCLSTopicName(page, datasourceId, item.logset_id, item.topic_id);
  if (!topicName) {
    throw new Error(`Cannot resolve topic name for topic_id=${item.topic_id}`);
  }

  // Select topic by display name
  await selectAntSelectOption(page, page.locator('.ant-input-group').filter({ hasText: '日志主题' }).getByRole('combobox').first(), topicName);

  // Fill time range
  await fillRelativeTimeRange(page, item.range, 'tencent-cls');

  // Fill the LogQL CodeMirror editor for the query text
  const editor = page.locator('.logql-codemirror .cm-content').first();
  await expect(editor, 'tencent-cls query CodeMirror editor').toBeVisible();
  await editor.click();
  await editor.fill(item.query);

  // Expand Advanced Settings (collapsed by default for CLS) and fill common fields
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
        throw new Error(`TODO: tencent-cls rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
