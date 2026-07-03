import { expect, type Locator, type Page } from '@playwright/test';

import { fillInputGroup, selectAntSelectOption } from '../../helpers';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillTriggers, type AlertRuleTrigger } from '../helpers';

interface SLSQuery extends NormalizedQuery {
  project?: string;
  logstore?: string;
  query?: string;
  power_sql?: boolean;
  range?: {
    start: string;
    end: string;
    display?: string;
  };
  keys?: {
    timeKey?: string;
    timeFormat?: string;
    valueKey?: string[];
  };
  unit?: string;
}

function inputGroup(page: Page, label: string, index = 0) {
  return page.locator('.ant-input-group').filter({ hasText: label }).nth(index);
}

async function fillAutoCompleteInputGroup(page: Page, label: string, value: string) {
  await fillInputGroup(page, label, value);
  await page.keyboard.press('Enter');
}

function getRelativeRangeLabel(range: SLSQuery['range']) {
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

async function fillRelativeRange(page: Page, range: SLSQuery['range']) {
  const label = getRelativeRangeLabel(range);
  if (!range || !label) {
    throw new Error(`TODO: aliyun-sls rule_config.queries[0].range=${JSON.stringify(range)} is not supported by the E2E handler yet`);
  }

  const rangeGroup = inputGroup(page, '查询区间');
  const button = rangeGroup.locator('button.flashcat-timeRangePicker-target');
  await expect(button, 'aliyun-sls query range picker').toBeVisible();
  const currentText = (await button.innerText()).trim();
  if (currentText.includes(label)) return;

  await button.click();
  const popover = page.locator('.flashcat-timeRangePicker-container').last();
  await expect(popover, 'aliyun-sls query range popover').toBeVisible();
  await popover.getByText(label, { exact: true }).click();
  await expect(popover, 'aliyun-sls query range popover should close').toBeHidden();
}

async function setPowerSql(page: Page, checked: boolean | undefined) {
  if (checked === undefined) return;
  const switchControl = page.locator('#rule_config_queries_0_power_sql').or(page.locator('xpath=(//*[normalize-space(.)="SQL 增强"]/following::*[@role="switch"])[1]')).first();
  await expect(switchControl, 'aliyun-sls SQL 增强 switch').toBeVisible();
  const current = await switchControl.isChecked();
  if (current !== checked) {
    await switchControl.click();
    await expect(switchControl).toBeChecked({ checked });
  }
}

async function fillLogQL(page: Page, value: string) {
  const editor = page.locator('.ant-input-group').filter({ hasText: '查询条件' }).locator('.cm-content[contenteditable="true"]').first();
  await expect(editor, 'aliyun-sls query editor').toBeVisible();
  await editor.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.type(value);
}

async function expandAdvancedSettings(page: Page) {
  const toggle = page.getByText('辅助配置', { exact: true }).filter({ visible: true });
  await expect(toggle, 'aliyun-sls advanced settings toggle').toBeVisible();
  const advancedPanel = page.locator('.ant-input-group').filter({ hasText: 'ValueKey' });
  if (await advancedPanel.isVisible().catch(() => false)) return;
  await toggle.click();
  await expect(advancedPanel, 'aliyun-sls advanced settings panel').toBeVisible();
}

async function fillInputGroupTags(page: Page, label: string, values: string[]) {
  if (values.length === 0) return;
  const group = inputGroup(page, label);
  const combobox = group.getByRole('combobox').last();
  await expect(combobox, `${label} tags select`).toBeVisible();
  for (const value of values) {
    await combobox.click();
    await combobox.fill(value);
    await page.keyboard.press('Enter');
    await expect(group.locator('.ant-select-selection-item').filter({ hasText: value }).first(), `${label} selected tag ${value}`).toBeVisible();
  }
}

async function fillAdvancedSettings(page: Page, item: SLSQuery) {
  const needsAdvanced = Boolean(item.keys?.valueKey?.length || item.keys?.timeKey || item.keys?.timeFormat || item.unit);
  if (!needsAdvanced) return;

  await expandAdvancedSettings(page);

  if (item.keys?.valueKey?.length) {
    await fillInputGroupTags(page, 'ValueKey', item.keys.valueKey);
  }
  if (item.keys?.timeKey) {
    await fillInputGroup(page, 'TimeKey', item.keys.timeKey);
  }
  if (item.keys?.timeFormat) {
    await fillInputGroup(page, 'TimeFormat', item.keys.timeFormat);
  }
  if (item.unit && item.unit !== 'none') {
    const unitSelect = inputGroup(page, '单位').getByRole('combobox').first();
    await selectAntSelectOption(page, unitSelect as Locator, item.unit);
  }
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for aliyun-sls alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: aliyun-sls rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as SLSQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: aliyun-sls rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.project) throw new Error('Missing aliyun-sls rule_config.queries[0].project');
  if (!item.logstore) throw new Error('Missing aliyun-sls rule_config.queries[0].logstore');
  if (!item.query) throw new Error('Missing aliyun-sls rule_config.queries[0].query');

  await aiTap('左侧配置步骤中的告警条件');

  const projectInput = inputGroup(page, '项目').locator('input:not([type="hidden"])').last();
  if (!(await projectInput.isVisible({ timeout: 5000 }).catch(() => false))) {
    throw new Error('aliyun-sls PlusAlertRule fields are not rendered. The SLS config cannot be filled in this build.');
  }

  await fillAutoCompleteInputGroup(page, '项目', item.project);
  await fillAutoCompleteInputGroup(page, '日志库', item.logstore);
  await fillRelativeRange(page, item.range);
  await setPowerSql(page, item.power_sql);
  await fillLogQL(page, item.query);
  await fillAdvancedSettings(page, item);

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
        throw new Error(`TODO: aliyun-sls rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
