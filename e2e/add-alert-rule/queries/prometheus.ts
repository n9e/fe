import { expect, type Page } from '@playwright/test';

import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { AlertRuleConditionHandler, NormalizedAlertRuleConfig } from '../types';
import { fillBuilderTrigger, type AlertRuleTrigger } from '../helpers';

async function addQueryIfNeeded(page: Page, queryIndex: number, aiTap: AiTap) {
  if (queryIndex === 0) return;
  await aiTap('添加查询和阈值');
  await page.waitForTimeout(300);
}

async function selectUnitIfNeeded(page: Page, queryIndex: number, unit: string | undefined) {
  if (!unit || unit === 'none') return;

  await page.getByText('高级设置').nth(queryIndex).click();
  const unitSelect = page.locator('.ant-input-group').filter({ hasText: '单位' }).nth(queryIndex).getByRole('combobox');
  if (!(await unitSelect.isVisible({ timeout: 3000 }).catch(() => false))) {
    throw new Error(`Cannot set prometheus query unit=${unit}: unit picker is not visible in this build`);
  }
  await unitSelect.click();
  await unitSelect.fill(unit);
  await page.keyboard.press('Enter');
}

function queryUnit(unit: unknown) {
  return typeof unit === 'string' ? unit : undefined;
}

async function focusAlertConditionSection(aiTap: AiTap, aiWaitFor: AiWaitFor) {
  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到规则模式、普通模式、高级模式');
}

async function fillPrometheusV1(page: Page, uiConfig: NormalizedAlertRuleConfig, aiAssert: AiAssert, aiTap: AiTap, aiWaitFor: AiWaitFor) {
  await focusAlertConditionSection(aiTap, aiWaitFor);
  await aiAssert(`存在${uiConfig.ruleVersionName}`);

  for (const [index, item] of uiConfig.queries.entries()) {
    await addQueryIfNeeded(page, index, aiTap);

    if (!item.promQl) {
      throw new Error(`Missing rule_config.queries[${index}].prom_ql for prometheus v1 alert rule`);
    }

    await page.getByRole('textbox', { name: 'Editor content' }).nth(index).fill(item.promQl);
    if (item.severityName) {
      await expect(page.getByRole('radio', { name: item.severityName }).nth(index)).toBeChecked();
    }

    await selectUnitIfNeeded(page, index, queryUnit(item.unit));
  }

  await page.getByRole('spinbutton', { name: /持续时长/ }).fill(String(uiConfig.promForDuration));
}

async function addV2QueryIfNeeded(page: Page, queryIndex: number, aiTap: AiTap) {
  if (queryIndex === 0) return;
  await aiTap('查询语句');
  await page.waitForTimeout(300);
}

async function addV2TriggerIfNeeded(page: Page, triggerIndex: number, aiTap: AiTap) {
  if (triggerIndex === 0) return;
  await aiTap('阈值判断');
  await page.waitForTimeout(300);
}

async function fillPrometheusV2(page: Page, uiConfig: NormalizedAlertRuleConfig, aiAssert: AiAssert, aiTap: AiTap, aiScroll: AiScroll, aiWaitFor: AiWaitFor) {
  await focusAlertConditionSection(aiTap, aiWaitFor);
  await aiTap('规则模式中的高级模式');
  await aiWaitFor('高级模式已选中，并且可以看到查询语句和阈值判断');

  for (const [index, item] of uiConfig.queries.entries()) {
    await addV2QueryIfNeeded(page, index, aiTap);

    if (!item.query) {
      throw new Error(`Missing rule_config.queries[${index}].query for prometheus v2 alert rule`);
    }

    if (item.ref !== 'A') {
      throw new Error(`TODO: prometheus v2 rule_config.queries[${index}].ref=${item.ref} is not supported yet`);
    }

    await page.getByRole('textbox', { name: 'Editor content' }).nth(index).fill(item.query);
    await selectUnitIfNeeded(page, index, queryUnit(item.unit));
  }

  if (!uiConfig.triggers.length) {
    throw new Error('Missing rule_config.triggers for prometheus v2 alert rule');
  }

  for (const [index, trigger] of (uiConfig.triggers as unknown as AlertRuleTrigger[]).entries()) {
    await addV2TriggerIfNeeded(page, index, aiTap);
    await fillBuilderTrigger(
      trigger,
      index,
      page,
      {
        scrollDescription: '向下滚动到阈值判断区域',
        waitForDescription: '可以看到阈值判断区域中的简单模式、比较符下拉框和数值输入框',
        comparisonFieldDescription: '比较符下拉框，当前显示为大于号',
        valueFieldDescription: '阈值判断数值输入框',
      },
      aiAssert,
      aiScroll,
      aiTap,
      aiWaitFor,
    );
    if (trigger.recover_config && trigger.recover_config.judge_type !== 1) {
      throw new Error(`TODO: prometheus v2 rule_config.triggers[${index}].recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
    }
  }

  await page.getByRole('spinbutton', { name: /持续时长/ }).fill(String(uiConfig.promForDuration));
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiTap, aiScroll, aiWaitFor }) => {
  if (!aiAssert || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiWaitFor fixtures for prometheus alert rule handler');
  }

  if (uiConfig.ruleVersionName === '普通模式') {
    await fillPrometheusV1(page, uiConfig, aiAssert, aiTap, aiWaitFor);
    return;
  }

  if (uiConfig.ruleVersionName === '高级模式') {
    if (!aiScroll) {
      throw new Error('Missing Midscene aiScroll fixture for prometheus v2 alert rule handler');
    }
    await fillPrometheusV2(page, uiConfig, aiAssert, aiTap, aiScroll, aiWaitFor);
    return;
  }

  throw new Error(`Unsupported prometheus rule mode: ${uiConfig.ruleVersionName}`);
};

export default query;
