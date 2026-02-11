import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { IndexDataItem, ClusteringItem, ClusterPattern } from './types';

export type { IndexDataItem, ClusteringItem };

// export const getDorisDatabases = (data: DorisDBParams): Promise<string[]> => {
//   return request('/api/n9e/db-databases', {
//     method: RequestMethod.Post,
//     data,
//   }).then((res) => res.dat);
// };

export const getLogClustering = (logs: any[], by: string): Promise<ClusteringItem[]> => {
  return request('/api/fc-model/log-clusting/logs', {
    method: RequestMethod.Post,
    data: {
      logs,
      by,
    },
  }).then((res) => res.data.items);
};

export const getQueryClustering = (cate: 'doris' | 'elasticsearch', query: string, by: string): Promise<ClusteringItem[]> => {
  return request('/api/fc-model/log-clusting/query', {
    method: RequestMethod.Post,
    data: {
      cate,
      query,
      by,
    },
  }).then((res) => res.data.items);
};

export const getLogPattern = (uuid: string, part_id: number): Promise<ClusterPattern> => {
  return request('/api/fc-model/log-clusting/pattern', {
    method: RequestMethod.Post,
    data: {
      uuid,
      part_id,
    },
  }).then((res) => res.data);
};

export const getLogHistogram = (uuid: string): Promise<{ values: [number, number][] }> => {
  return request('/api/fc-model/log-clusting/histogram', {
    method: RequestMethod.Post,
    data: {
      uuid,
    },
  }).then((res) => res.data);
};
