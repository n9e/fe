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
