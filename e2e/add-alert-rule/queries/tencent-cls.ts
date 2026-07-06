import { expect, type Page } from '@playwright/test';

import { BASE_URL, doLogin } from '../../fixture';
import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillTriggers, type AlertRuleTrigger } from '../helpers';

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

function getRelativeRangeLabel(range: CLSQuery['range']) {
  if (!range) return undefined;
  if (range.start === 'now-5m' && range.end === 'now') return '最近 5 分钟';
  if (range.start === 'now-15m' && range.end === 'now') return '最近 15 分钟';
  if (range.start === 'now-30m' && range.end === 'now') return '最近 30 分钟';
  if (range.start === 'now-1h' && range.end === 'now') return '最近 1 小时';
  if (range.start === 'now-3h' && range.end === 'now') return '最近 3 小时';
  if (range.start === 'now-6h' && range.end === 'now') return '最近 6 小时';
  if (range.start === 'now-12h' && range.end === 'now') return '最近 12 小时';
  if (range.start === 'now-24h' && range.end === 'now') return '最近 24 小时';
  if (range.start === 'now-2d' && range.end === 'now') return '最近 2 天';
  if (range.start === 'now-7d' && range.end === 'now') return '最近 7 天';
  if (range.start === 'now-30d' && range.end === 'now') return '最近 30 天';
  if (range.start === 'now-90d' && range.end === 'now') return '最近 90 天';
  if (range.start === 'now/d' && range.end === 'now/d') return '今天';
  return undefined;
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
 * Resolve the tencent-cls datasource ID from the datasource brief API.
 */
async function resolveDatasourceId(page: Page): Promise<number | undefined> {
  const { access_token } = await doLogin(page);
  const resp = await page.request.get(`${BASE_URL}/api/n9e/datasource/brief`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!resp.ok()) return undefined;
  const data = await resp.json();
  const list: Array<{ id: number; plugin_type: string }> = Array.isArray(data?.dat) ? data.dat : Array.isArray(data) ? data : [];
  return list.find((item) => item.plugin_type === 'tencent-cls')?.id;
}

async function setSelectValueByLabel(page: Page, label: string, optionLabel: string) {
  const selectItem = page.locator('.ant-input-group').filter({ hasText: label }).locator('.ant-select-selector');
  await expect(selectItem, `${label} Select`).toBeVisible();
  await selectItem.click();
  await page.waitForTimeout(300);
  const option = page.locator('.ant-select-item-option-content').filter({ hasText: optionLabel });
  await expect(option.first(), `${label} option "${optionLabel}"`).toBeVisible({ timeout: 3000 });
  await option.first().click();
  await page.waitForTimeout(200);
}

async function setRelativeTimeRange(page: Page, range: CLSQuery['range']) {
  const label = getRelativeRangeLabel(range);
  if (!range || !label) {
    throw new Error(`TODO: tencent-cls rule_config.queries[0].range=${JSON.stringify(range)} is not supported by the E2E handler yet`);
  }

  const rangeGroup = page.locator('.ant-input-group').filter({ hasText: '查询区间' });
  const button = rangeGroup.locator('button.flashcat-timeRangePicker-target');
  await expect(button, 'tencent-cls query range picker').toBeVisible();
  const currentText = (await button.innerText()).trim();
  if (currentText.includes(label)) return;

  await button.click();
  const popover = page.locator('.flashcat-timeRangePicker-container').last();
  await expect(popover, 'tencent-cls query range popover').toBeVisible();
  await popover.getByText(label, { exact: true }).click();
  await expect(popover, 'tencent-cls query range popover should close').toBeHidden();
}

async function fillInputGroupTags(page: Page, label: string, values: string[]) {
  if (values.length === 0) return;
  const group = page.locator('.ant-input-group').filter({ hasText: label });
  const combobox = group.getByRole('combobox').last();
  await expect(combobox, `${label} tags select`).toBeVisible();
  for (const value of values) {
    await combobox.click();
    await combobox.fill(value);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
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

  // Resolve datasource ID and CLS logset/topic names via API
  const datasourceId = await resolveDatasourceId(page);
  if (!datasourceId) {
    throw new Error('Cannot resolve tencent-cls datasource ID from API');
  }

  const logsetName = await resolveCLSLogsetName(page, datasourceId, item.logset_id);
  if (!logsetName) {
    throw new Error(`Cannot resolve logset name for logset_id=${item.logset_id}`);
  }

  // Select logset by display name
  await setSelectValueByLabel(page, '日志集', logsetName);

  // Wait for topic options to load (depends on logset selection)
  await page.waitForTimeout(1000);

  const topicName = await resolveCLSTopicName(page, datasourceId, item.logset_id, item.topic_id);
  if (!topicName) {
    throw new Error(`Cannot resolve topic name for topic_id=${item.topic_id}`);
  }

  // Select topic by display name
  await setSelectValueByLabel(page, '日志主题', topicName);

  // Fill time range
  if (item.range) {
    await setRelativeTimeRange(page, item.range);
  }

  // Fill the LogQL CodeMirror editor for the query text
  const editor = page.locator('.logql-codemirror .cm-content').first();
  await expect(editor, 'tencent-cls query CodeMirror editor').toBeVisible();
  await editor.click();
  await editor.fill(item.query);

  // Expand Advanced Settings (collapsed by default for CLS)
  await aiTap('辅助配置');
  await page.waitForTimeout(300);

  // Fill keys in Advanced Settings
  if (item.keys) {
    const valueKeys = Array.isArray(item.keys.valueKey) ? item.keys.valueKey : item.keys.valueKey ? [item.keys.valueKey] : [];
    if (valueKeys.length > 0) {
      await fillInputGroupTags(page, 'ValueKey', valueKeys);
    }

    const labelKeys = Array.isArray(item.keys.labelKey) ? item.keys.labelKey : item.keys.labelKey ? [item.keys.labelKey] : [];
    if (labelKeys.length > 0) {
      await fillInputGroupTags(page, 'LabelKey', labelKeys);
    }

    if (item.keys.timeKey) {
      const timeKeyInput = page.locator('.ant-input-group').filter({ hasText: 'TimeKey' }).locator('input').last();
      if (await timeKeyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await timeKeyInput.fill(item.keys.timeKey);
      }
    }
  }

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
