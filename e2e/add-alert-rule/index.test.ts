import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import type { Page, Response } from '@playwright/test';

import { BASE_URL, loginAndSetTokens, test } from '../fixture';
import { fetchReferenceData } from './reference-data';
import { loadAlertRuleConfigs } from '../config-loader';
import type { AlertRuleConfig } from './types';
import { normalizeAlertRuleForUi, buildExpectedAlertRule, isPlainObject } from './normalizer';
import { fillBasicStep } from './steps/basic';
import { fillDatasourceStep } from './steps/datasource';
import { fillRuleStep } from './steps/rule';
import { fillPipelineStep } from './steps/pipeline';
import { fillEffectiveStep } from './steps/effective';
import { fillNotifyStep } from './steps/notify';

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
    params: { limit: 5000 },
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
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await loginAndSetTokens(page);
  });

  test.afterEach(async ({}, testInfo) => {
    // 并行跑时其他 worker 可能还在写报告，避免互相删除。
    if (testInfo.config.workers > 1) return;
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

      const refs = await fetchReferenceData(page, alertRuleConfig.group_id);
      const uiConfig = normalizeAlertRuleForUi(alertRuleConfig, refs);

      // 清理之前测试可能残留的规则
      const existingRules = await fetchAlertRulesForGroup(page, alertRuleConfig.group_id);
      const rulesToClean = collectAlertRules(existingRules).filter((r) => {
        // 同名规则（name 含时间戳）
        if (r.name === uiConfig.name) return true;
        // 之前测试失败残留的规则（名字以 base- 开头）
        if (r.name && uiConfig.name.startsWith(`${alertRuleConfig.name}-`) && r.name.startsWith(`${alertRuleConfig.name}-`)) return true;
        // 已知的特定残留规则名
        if (r.name === 'source_labels') return true;
        return false;
      });
      for (const r of rulesToClean) {
        if (r.id) {
          await deleteAlertRule(page, alertRuleConfig.group_id, r.id);
        }
      }

      // 等待 SPA 渲染完成后再调用 Midscene，避免 agent 初始化时因页面路由切换导致 style 注入失败
      await aiWaitFor('告警规则新增表单已显示，页面中有基础配置、数据源、告警条件等区域');

      // Phase: 基础配置
      await fillBasicStep(page, uiConfig, aiTap);

      // Phase: 数据源筛选
      await fillDatasourceStep(page, uiConfig, aiTap);

      // Phase: 告警条件
      await fillRuleStep(page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor);

      // Phase: 事件处理
      await fillPipelineStep(page, uiConfig, aiTap, aiWaitFor);

      // Phase: 生效配置
      await fillEffectiveStep(page, uiConfig, aiTap, aiWaitFor);

      // Phase: 通知配置
      await fillNotifyStep(page, uiConfig, aiTap);

      const saveResponsePromise = page.waitForResponse((response: Response) => {
        const request = response.request();
        return request.method() === 'POST' && /\/api\/n9e\/busi-group\/\d+\/alert-rules$/.test(response.url());
      });

      await aiTap('保存按钮');
      const saveResponse = await saveResponsePromise;
      expect(saveResponse.ok()).toBeTruthy();
      const saveBody = await saveResponse.json().catch(() => undefined);
      expect(saveBody?.err || '').toBeFalsy();

      // 从 save 响应中提取已创建规则的 ID
      const createdId: number | undefined =
        typeof saveBody?.dat === 'number'
          ? saveBody.dat
          : Array.isArray(saveBody?.dat)
          ? (saveBody.dat[0] as number | undefined)
          : typeof saveBody?.dat?.id === 'number'
          ? saveBody.dat.id
          : undefined;

      // 检查 save 响应中的业务错误：dat 中任何非空字符串的 key 都表示字段级错误
      const saveFieldErrors =
        saveBody?.dat && typeof saveBody.dat === 'object' && !Array.isArray(saveBody.dat)
          ? Object.entries(saveBody.dat as Record<string, unknown>)
              .filter(([, v]) => v !== '' && v !== undefined && v !== null)
              .map(([k, v]) => `${k}: ${v}`)
          : [];
      expect(saveFieldErrors, `save response contains business errors: ${JSON.stringify(saveBody)}`).toEqual([]);

      let createdRule: AlertRuleRecord | undefined;
      try {
        // 优先通过 API 直接查询创建结果
        const alertRulesBody = await fetchAlertRulesForGroup(page, alertRuleConfig.group_id);
        const allRules = collectAlertRules(alertRulesBody);

        if (createdId) {
          createdRule = allRules.find((rule) => rule.id === createdId);
        }
        if (!createdRule) {
          createdRule = allRules.find((rule) => rule.name === uiConfig.name);
        }

        expect(createdRule, `Created alert rule not found in group ${alertRuleConfig.group_id}. Save response: ${JSON.stringify(saveBody)}`).toBeTruthy();
        assertAlertRuleMatchesConfig(createdRule, buildExpectedAlertRule(alertRuleConfig, uiConfig, refs));

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
