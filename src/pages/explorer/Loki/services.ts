import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

export function getLogsQuery(datasourceValue: number, params) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/query_range`, {
    method: RequestMethod.Get,
    params,
  }).then(res => res.data)
}
