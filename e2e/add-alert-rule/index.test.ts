import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import type { Page, Response } from '@playwright/test';

import { BASE_URL, loginAndSetTokens, test } from '../fixture';
import { fetchReferenceData } from './reference-data';
import { fillAntFormItemInput, selectAntOption } from '../helpers';
import { loadAlertRuleConfigs } from '../config-loader';
import type { AlertRuleConfig } from './types';
import { getAlertRuleConditionHandler } from './queries';
import { normalizeAlertRuleForUi, buildExpectedAlertRule, isPlainObject } from './normalizer';
import { selectFirstDatasourceFilterValue } from './helpers';

const ALERT_RULE_CONFIGS = loadAlertRuleConfigs<AlertRuleConfig>(path.resolve(__dirname, 'configs'));

interface AlertRuleRecord extends Record<string, unknown> {
  id?: number;
  name?: string;
  cate?: string;
  datasource_queries?: unknown;
  rule_config?: unknown;
}

function assertConfigSubset(actual: unknown, expected: unknown, path: string) {
  if (Array.isArray(expected)) {
    expect(Array.isArray(actual), `${path} should be an array`).toBeTruthy();
    expect(actual as unknown[], `${path} array length`).toHaveLength(expected.length);
    expected.forEach((item, index) => {
      assertConfigSubset((actual as unknown[])[index], item, `${path}[${index}]`);
    });
    return;
  }

  if (isPlainObject(expected)) {
    expect(isPlainObject(actual), `${path} should be an object`).toBeTruthy();
    Object.entries(expected).forEach(([key, value]) => {
      assertConfigSubset((actual as Record<string, unknown>)[key], value, `${path}.${key}`);
    });
    return;
  }

  expect(actual, path).toEqual(expected);
}

function assertAlertRuleMatchesConfig(createdRule: unknown, expected: AlertRuleConfig) {
  assertConfigSubset(createdRule, expected, 'createdRule');
}

function collectAlertRules(value: unknown): AlertRuleRecord[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAlertRules(item));
  }

  if (!isPlainObject(value)) {
    return [];
  }

  const current = value.name && (value.cate || value.rule_config || value.datasource_queries) ? [value] : [];
  return current.concat(Object.values(value).flatMap((item) => collectAlertRules(item)));
}

async function getAccessToken(page: Page) {
  return page.evaluate(() => localStorage.getItem('access_token'));
}

async function fetchAlertRulesForGroup(page: Page, groupId: number) {
  const accessToken = await getAccessToken(page);
  const resp = await page.request.get(`${BASE_URL}/api/n9e/busi-group/${groupId}/alert-rules`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  expect(resp.ok()).toBeTruthy();
  return resp.json();
}

async function deleteAlertRule(page: Page, groupId: number, ruleId: number) {
  const accessToken = await getAccessToken(page);
  const resp = await page.request.delete(`${BASE_URL}/api/n9e/busi-group/${groupId}/alert-rules`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    data: { ids: [ruleId] },
  });
  expect(resp.ok()).toBeTruthy();
  const body = (await resp.json().catch(() => undefined)) as { err?: string } | undefined;
  expect(body?.err || '').toBeFalsy();
}

async function expectAlertRuleDeleted(page: Page, groupId: number, ruleName: string) {
  const body = await fetchAlertRulesForGroup(page, groupId);
  const rule = collectAlertRules(body).find((item) => item.name === ruleName);
  expect(rule, `alert rule ${ruleName} should be deleted`).toBeFalsy();
}

test.describe('add alert rule', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await loginAndSetTokens(page);
  });

  test.afterEach(async ({}, testInfo) => {
    // 测试通过则清理所有报告。失败时保留供人工排查。
    if (testInfo.status !== 'passed') return;
    const reportDir = 'midscene_run/report';
    if (!fs.existsSync(reportDir)) return;
    for (const file of fs.readdirSync(reportDir)) {
      try {
        fs.rmSync(`${reportDir}/${file}`);
      } catch {
        // 单个文件清理失败不影响后续
      }
    }
  });

  for (const alertRuleConfig of ALERT_RULE_CONFIGS) {
    test(`creates ${alertRuleConfig.cate} alert rule from config: ${alertRuleConfig.name}`, async ({ page, aiAssert, aiScroll, aiTap, aiWaitFor, recordToReport }) => {
      await page.goto(`${BASE_URL}/alert-rules/add/${alertRuleConfig.group_id}`);
      await page.waitForLoadState('networkidle');

      const refs = await fetchReferenceData(page);
      const uiConfig = normalizeAlertRuleForUi(alertRuleConfig, refs);

      // 等待 SPA 渲染完成后再调用 Midscene，避免 agent 初始化时因页面路由切换导致 style 注入失败
      await aiWaitFor('告警规则新增表单已显示，页面中有基础配置、数据源、告警条件等区域');

      await fillAntFormItemInput(page, '规则名称', uiConfig.name);

      if (
        !(await page
          .getByText(uiConfig.groupName)
          .isVisible()
          .catch(() => false))
      ) {
        await selectAntOption(aiTap, '业务组下拉选择框', uiConfig.groupName);
      }

      if (uiConfig.note) {
        await fillAntFormItemInput(page, '备注', uiConfig.note);
      }

      if (uiConfig.cate !== 'prometheus') {
        await aiTap(uiConfig.cateName);
      }
      await expect(page.getByText(uiConfig.cateName).first()).toBeVisible();

      const datasourceQuery = uiConfig.datasourceQueries[0];
      await expect(page.getByText(datasourceQuery.matchTypeName).first()).toBeVisible();
      await expect(page.getByText(datasourceQuery.opName).first()).toBeVisible();
      for (const datasourceName of datasourceQuery.datasourceNames) {
        await selectFirstDatasourceFilterValue(page, datasourceName);
      }

      const handleAlertRuleCondition = getAlertRuleConditionHandler(uiConfig.queryHandlerKey);
      await handleAlertRuleCondition({ page, uiConfig, aiAssert, aiTap, aiScroll, aiWaitFor });

      if (uiConfig.cronPattern !== '@every 60s') {
        throw new Error(`TODO: non-default cron_pattern is not supported yet: ${uiConfig.cronPattern}`);
      }

      if (!uiConfig.effectiveIsDefault) {
        throw new Error('TODO: non-default effective config is not supported yet');
      }

      if (!uiConfig.notifyIsDefault) {
        throw new Error('TODO: non-default notify config is not supported yet');
      }

      const saveResponsePromise = page.waitForResponse((response: Response) => {
        const request = response.request();
        return request.method() === 'POST' && /\/api\/n9e\/busi-group\/\d+\/alert-rules$/.test(response.url());
      });

      await aiTap('保存按钮');
      const saveResponse = await saveResponsePromise;
      expect(saveResponse.ok()).toBeTruthy();
      const saveBody = await saveResponse.json().catch(() => undefined);
      expect(saveBody?.err || '').toBeFalsy();

      const saveErrors = saveBody?.dat && typeof saveBody.dat === 'object' ? Object.values(saveBody.dat).filter(Boolean) : [];
      expect(saveErrors, `save response contains business errors: ${JSON.stringify(saveBody)}`).toEqual([]);

      let createdRule: AlertRuleRecord | undefined;
      try {
        await page.goto(`${BASE_URL}/alert-rules`);
        await page.waitForLoadState('networkidle');

        await page.getByPlaceholder('搜索名称或标签').fill(uiConfig.name);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        const alertRulesBody = await fetchAlertRulesForGroup(page, alertRuleConfig.group_id);
        createdRule = collectAlertRules(alertRulesBody).find((rule) => rule.name === uiConfig.name);

        expect(createdRule).toBeTruthy();
        assertAlertRuleMatchesConfig(createdRule, buildExpectedAlertRule(alertRuleConfig, uiConfig));

        await recordToReport(`${uiConfig.cate} alert rule created`, {
          content: `Created and verified rule ${uiConfig.name}`,
        });
      } finally {
        if (createdRule?.id) {
          await deleteAlertRule(page, alertRuleConfig.group_id, createdRule.id);
          await expectAlertRuleDeleted(page, alertRuleConfig.group_id, uiConfig.name);
        }
      }
    });
  }
});
