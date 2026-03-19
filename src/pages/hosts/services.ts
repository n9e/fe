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
  return request('/api/n9e-plus/targets', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getStats(params: { gids: string }): Promise<Stats> {
  // return request('/api/n9e-plus/targets', {
  //   method: RequestMethod.Get,
  //   params,
  // });
  // 先返回一个测试数据
  return Promise.resolve({
    count: 5721,
    alive_count: 3211,
    dead_count: 2510,
    memory_usage: {
      '-1': 5,
      '20': 10,
      '40': 30,
      '60': 25,
      '80': 20,
      '100': 15,
    },
    cpu_usage: {
      '-1': 5,
      '20': 50,
      '40': 30,
      '60': 15,
      '80': 4,
      '100': 1,
    },
    versions: {
      '': 10,
      unknown: 20,
      'ent-v0.3.161': 50,
      'ent-v0.3.162': 30,
      'ent-v0.3.163': 20,
      'ent-v0.3.164': 20,
      'ent-v0.3.59': 15,
      'ent-v0.4.30': 10,
      'ent-v0.4.36': 5,
      'ent-v0.4.37': 5,
      'v0.3.19': 10,
      'v0.3.20': 20,
      'v0.3.21': 30,
      'v0.3.22': 40,
      'v0.3.23': 50,
      'v0.3.24': 60,
      'v0.3.25': 70,
      'v0.3.26': 80,
      'v0.3.27': 90,
      'v0.3.28': 100,
      'v0.3.29': 60,
      'v0.3.30': 120,
      'v0.3.31': 70,
      'v0.3.32': 140,
      'v0.3.33': 80,
    },
  });
}

export function getTargetInformationByIdent(ident: string) {
  return request('/api/n9e/target/extra-meta', {
    method: RequestMethod.Get,
    params: {
      ident,
    },
  }).then((res) => {
    const dat = res?.dat?.extend_info;
    try {
      return JSON.parse(dat);
    } catch (e) {
      return {};
    }
  });
}

export function putTargetsBgids(data: { bgids: number[]; idents: string[]; action: string }) {
  return request('/api/n9e/targets/bgids', {
    method: RequestMethod.Put,
    data,
  });
}

export function getBusiGroupsTags() {
  return request('/api/n9e/busi-groups/tags', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}
