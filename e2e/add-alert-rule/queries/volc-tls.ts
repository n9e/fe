import { expect, type Page } from '@playwright/test';
import { BASE_URL, doLogin } from '../../fixture';
import { selectAntInputGroupOption } from '../../helpers';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillAdvancedSettings, fillRelativeTimeRange, fillTriggers, type AlertRuleTrigger } from '../helpers';

interface ProjectItem {
  ProjectId: string;
  ProjectName: string;
}

interface TopicItem {
  TopicId: string;
  TopicName: string;
}

interface VolcTLSQuery extends NormalizedQuery {
  query?: string;
  project_id?: string;
  topic_id?: string;
  from?: number;
  to?: number;
  range?: {
    start: string;
    end: string;
    display?: string;
  };
  keys?: {
    labelKey?: string | string[];
    valueKey?: string | string[];
    timeKey?: string;
  };
  unit?: string;
}

/**
 * Fetch TLS project data and resolve project_id → ProjectName.
 */
async function resolveTLSProjectName(page: Page, datasourceId: number, projectId: string): Promise<string | undefined> {
  const { access_token } = await doLogin(page);
  const resp = await page.request.post(`${BASE_URL}/api/n9e-plus/tls-project`, {
    headers: { Authorization: `Bearer ${access_token}` },
    data: { cate: 'volc-tls', datasource_id: datasourceId },
  });
  if (!resp.ok()) return undefined;
  const data = await resp.json();
  const list: ProjectItem[] = Array.isArray(data?.dat) ? data.dat : Array.isArray(data) ? data : [];
  return list.find((item) => item.ProjectId === projectId)?.ProjectName;
}

/**
 * Fetch TLS topic data and resolve topic_id → TopicName.
 */
async function resolveTLSTopicName(page: Page, datasourceId: number, projectId: string, topicId: string): Promise<string | undefined> {
  const { access_token } = await doLogin(page);
  const resp = await page.request.post(`${BASE_URL}/api/n9e-plus/tls-topic`, {
    headers: { Authorization: `Bearer ${access_token}` },
    data: { cate: 'volc-tls', datasource_id: datasourceId, project_id: projectId },
  });
  if (!resp.ok()) return undefined;
  const data = await resp.json();
  const list: TopicItem[] = Array.isArray(data?.dat) ? data.dat : Array.isArray(data) ? data : [];
  return list.find((item) => item.TopicId === topicId)?.TopicName;
}

/**
 * 填充 volc-tls（火山云 TLS）告警规则的条件。
 *
 * 通过调用 TLS API 实时解析 project_id/topic_id (UUID) 为用户可见的 ProjectName/TopicName，
 * 再通过 Ant Design Select 按 label 文本选择选项。
 * 查询条件使用 LogQL CodeMirror 编辑器。
 *
 * @see /src/plus/datasource/volcTLS/AlertRule/Queries/index.tsx
 * @see /src/plus/datasource/volcTLS/AlertRule/index.tsx
 */
const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene fixtures for volc-tls alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: volc-tls rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as VolcTLSQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: volc-tls rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if (!item.query) {
    throw new Error('Missing volc-tls rule_config.queries[0].query');
  }
  if (!item.project_id) {
    throw new Error('Missing volc-tls rule_config.queries[0].project_id');
  }
  if (!item.topic_id) {
    throw new Error('Missing volc-tls rule_config.queries[0].topic_id');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到日志项目、日志主题、查询区间和查询条件');

  // Read datasource ID from the already-normalized config
  const datasourceIds = uiConfig.datasourceQueries[0]?.datasourceIds;
  if (!datasourceIds || datasourceIds.length === 0) {
    throw new Error('Missing datasource_ids for volc-tls in the config');
  }
  const datasourceId = datasourceIds[0];

  // Resolve project_id → project name and select via Ant Design Select
  const projectName = await resolveTLSProjectName(page, datasourceId, item.project_id);
  if (!projectName) {
    throw new Error(`Cannot resolve project name for project_id=${item.project_id}`);
  }
  await selectAntInputGroupOption(aiTap, '日志项目', projectName);

  // Wait for topic options to load (depends on project selection)
  await page.waitForTimeout(1000);

  // Resolve topic_id → topic name and select via Ant Design Select
  const topicName = await resolveTLSTopicName(page, datasourceId, item.project_id, item.topic_id);
  if (!topicName) {
    throw new Error(`Cannot resolve topic name for topic_id=${item.topic_id}`);
  }
  await selectAntInputGroupOption(aiTap, '日志主题', topicName);

  // Fill time range
  await fillRelativeTimeRange(page, item.range, 'volc-tls');

  // Fill the LogQL CodeMirror editor for the query text
  const editor = page.locator('.logql-codemirror .cm-content').first();
  await expect(editor, 'volc-tls query CodeMirror editor').toBeVisible();
  await editor.click();
  await editor.fill(item.query);

  // Fill Advanced Settings (expanded by default for volc-tls, state=true)
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
        throw new Error(`TODO: volc-tls rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
