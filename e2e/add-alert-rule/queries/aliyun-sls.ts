import { expect, type Locator, type Page } from '@playwright/test';

import { fillAutoCompleteInputGroup, fillInputGroup } from '../../helpers';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillRelativeTimeRange, fillTriggers, type AlertRuleTrigger } from '../helpers';

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
  await fillRelativeTimeRange(page, item.range, 'aliyun-sls');
  await setPowerSql(page, item.power_sql);
  await fillLogQL(page, item.query);
  // 辅助配置 — 展开面板 + 通用字段
  const needsAdvanced = Boolean(item.keys?.valueKey?.length || item.keys?.timeKey || item.keys?.timeFormat || item.unit);
  if (needsAdvanced) {
    await fillAdvancedSettings(page, { ...item.keys, unit: item.unit });
  }

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
