import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

export function getLogsQuery(datasourceValue: number, params) {
  const isProOrEnt = import.meta.env.VITE_IS_ENT === 'true' || import.meta.env.VITE_IS_PRO === 'true'
  return request(`/api/${isProOrEnt?'n9e-plus':'n9e'}/proxy/${datasourceValue}/api/v1/query_range`, {
    method: RequestMethod.Get,
    params,
  }).then(res => res.data)
}
