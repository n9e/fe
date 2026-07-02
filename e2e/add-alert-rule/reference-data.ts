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

export interface ReferenceData {
  busiGroups: BusiGroupItem[];
  datasources: DatasourceItem[];
  teams: TeamItem[];
  notifyChannels: NotifyChannelItem[];
  notificationRules: NotificationRuleItem[];
  busiGroupNameMap: Record<number, string>;
  datasourceNameMap: Record<number, string>;
  teamNameMap: Record<number, string>;
  notifyChannelLabelMap: Record<string, string>;
  notificationRuleNameMap: Record<number, string>;
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

export async function fetchReferenceData(page: Page): Promise<ReferenceData> {
  if (cachedReferenceData) return cachedReferenceData;

  const { access_token } = await doLogin(page);
  const authHeaders = { Authorization: `Bearer ${access_token}` };

  const [busiGroupResp, datasourceResp, teamResp, notifyChannelResp, notificationRuleResp] = await Promise.all([
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
  ]);

  const busiGroups = readList<BusiGroupItem>(await busiGroupResp.json());
  const datasources = readList<DatasourceItem>(await datasourceResp.json());
  const teams = readList<TeamItem>(await teamResp.json());
  const notifyChannels = readList<NotifyChannelItem>(await notifyChannelResp.json());
  const notificationRules = readList<NotificationRuleItem>(await notificationRuleResp.json());

  cachedReferenceData = {
    busiGroups,
    datasources,
    teams,
    notifyChannels,
    notificationRules,
    busiGroupNameMap: buildIdNameMap(busiGroups),
    datasourceNameMap: buildIdNameMap(datasources),
    teamNameMap: buildIdNameMap(teams),
    notifyChannelLabelMap: notifyChannels.reduce<Record<string, string>>((map, item) => {
      map[item.key] = item.label;
      return map;
    }, {}),
    notificationRuleNameMap: buildIdNameMap(notificationRules),
  };

  return cachedReferenceData;
}
