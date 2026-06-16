import { IS_PLUS } from '@/utils/constant';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, Stats } from './types';

export type { Item, Stats };

export function getList(params: {
  query?: string;
  gids?: string;
  limit: number;
  p: number;
  hosts?: string;
  auth_level?: number; // 0 = 关闭AI开关 1、2、3 = 授权等级
  downtime?: number;
  agent_versions?: string;
}): Promise<{ list: Item[]; total: number }> {
  const url = IS_PLUS ? '/api/n9e-plus/targets' : '/api/n9e/targets';
  return request(url, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getStats(params: { gids?: string }): Promise<Stats> {
  return request('/api/n9e/targets/stats', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export const putAiTaskConfigs = function (data: {
  idents: string[];
  auth_level: number; // 0、1、2、3
}): Promise<{
  [host: string]: string;
}> {
  return request('/api/n9e-plus/ai-task-configs', {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat ?? []);
};
