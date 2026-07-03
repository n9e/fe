import type { Page } from '@playwright/test';
import { BASE_URL, doLogin } from '../fixture';

interface BusiGroupItem {
  id: number;
  name: string;
}

interface DatasourceItem {
  id: number;
  name: string;
  plugin_type: string;
  is_default?: boolean;
  plugin_type_name?: string;
}

interface TeamItem {
  id: number;
  name: string;
}

interface NotifyChannelItem {
  key: string;
  label: string;
}

interface NotificationRuleItem {
  id: number;
  name: string;
}

interface IndexPatternItem {
  id: number;
  name: string;
  datasource_id?: number;
  time_field?: string;
}

interface PipelineItem {
  id: number;
  name: string;
}

interface ServiceCalItem {
  id: number;
  name: string;
}

export interface ReferenceData {
  busiGroups: BusiGroupItem[];
  datasources: DatasourceItem[];
  teams: TeamItem[];
  notifyChannels: NotifyChannelItem[];
  notificationRules: NotificationRuleItem[];
  indexPatterns: IndexPatternItem[];
  busiGroupNameMap: Record<number, string>;
  datasourceNameMap: Record<number, string>;
  /** 反向映射：datasource 名称 → ID（用于构建 expected 时匹配 UI 实际选中的 ID） */
  datasourceIdByNameMap: Record<string, number>;
  teamNameMap: Record<number, string>;
  notifyChannelLabelMap: Record<string, string>;
  notificationRuleNameMap: Record<number, string>;
  indexPatternNameMap: Record<number, string>;
  pipelines: PipelineItem[];
  pipelineNameMap: Record<number, string>;
  serviceCals: ServiceCalItem[];
  serviceCalNameMap: Record<number, string>;
}

let cachedReferenceData: ReferenceData | null = null;

function readList<T>(body: any): T[] {
  if (Array.isArray(body?.dat)) return body.dat;
  if (Array.isArray(body?.dat?.dat)) return body.dat.dat;
  if (Array.isArray(body)) return body;
  return [];
}

function buildIdNameMap<T extends { id: number; name: string }>(items: T[]) {
  return items.reduce<Record<number, string>>((map, item) => {
    map[item.id] = item.name;
    return map;
  }, {});
}

export async function fetchReferenceData(page: Page, groupId?: number): Promise<ReferenceData> {
  if (cachedReferenceData) return cachedReferenceData;

  const { access_token } = await doLogin(page);
  const authHeaders = { Authorization: `Bearer ${access_token}` };

  const pipelineParams: Record<string, string | number> = { use_case: 'alert_rule', limit: 5000 };
  if (groupId !== undefined) {
    pipelineParams.group_id = groupId;
  }

  const [busiGroupResp, datasourceResp, teamResp, notifyChannelResp, notificationRuleResp, indexPatternResp, pipelineResp, serviceCalResp] = await Promise.all([
    page.request.get(`${BASE_URL}/api/n9e/busi-groups`, {
      headers: authHeaders,
      params: { limit: 5000 },
    }),
    page.request.get(`${BASE_URL}/api/n9e/datasource/brief`, {
      headers: authHeaders,
    }),
    page.request.get(`${BASE_URL}/api/n9e/user-groups`, {
      headers: authHeaders,
      params: { query: '', limit: 5000 },
    }),
    page.request.get(`${BASE_URL}/api/n9e/notify-channels`, {
      headers: authHeaders,
    }),
    page.request.get(`${BASE_URL}/api/n9e/notify-rules`, {
      headers: authHeaders,
    }),
    page.request.get(`${BASE_URL}/api/n9e/es-index-pattern-list`, {
      headers: authHeaders,
    }),
    page.request.get(`${BASE_URL}/api/n9e/event-pipelines`, {
      headers: authHeaders,
      params: pipelineParams,
    }),
    page.request
      .get(`${BASE_URL}/api/n9e-plus/service-cals`, {
        headers: authHeaders,
      })
      .catch(() => null),
  ]);

  const busiGroups = readList<BusiGroupItem>(await busiGroupResp.json());
  const datasources = readList<DatasourceItem>(await datasourceResp.json());
  const teams = readList<TeamItem>(await teamResp.json());
  const notifyChannels = readList<NotifyChannelItem>(await notifyChannelResp.json());
  const notificationRules = readList<NotificationRuleItem>(await notificationRuleResp.json());
  const indexPatterns = readList<IndexPatternItem>(await indexPatternResp.json());

  let pipelines: PipelineItem[] = [];
  let serviceCals: ServiceCalItem[] = [];

  if (pipelineResp?.ok()) {
    pipelines = readList<PipelineItem>(await pipelineResp.json());
  }
  if (serviceCalResp?.ok()) {
    serviceCals = readList<ServiceCalItem>(await serviceCalResp.json());
  }

  cachedReferenceData = {
    busiGroups,
    datasources,
    teams,
    notifyChannels,
    notificationRules,
    indexPatterns,
    pipelines,
    serviceCals,
    busiGroupNameMap: buildIdNameMap(busiGroups),
    datasourceNameMap: buildIdNameMap(datasources),
    datasourceIdByNameMap: datasources.reduce<Record<string, number>>((map, item) => {
      if (!(item.name in map)) {
        map[item.name] = item.id;
      }
      return map;
    }, {}),
    teamNameMap: buildIdNameMap(teams),
    notifyChannelLabelMap: notifyChannels.reduce<Record<string, string>>((map, item) => {
      map[item.key] = item.label;
      return map;
    }, {}),
    notificationRuleNameMap: buildIdNameMap(notificationRules),
    indexPatternNameMap: buildIdNameMap(indexPatterns),
    pipelineNameMap: buildIdNameMap(pipelines),
    serviceCalNameMap: buildIdNameMap(serviceCals),
  };

  return cachedReferenceData;
}
