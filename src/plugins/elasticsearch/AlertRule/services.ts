import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getDsQuery(params, silence = true) {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence,
  });
}

export function getLogsQuery(params) {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence: true,
  }).then((res) => res.dat);
}
