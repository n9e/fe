import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9E_PATHNAME } from '@/utils/constant';

import type { DashboardQueryRequest, DashboardQueryResponse } from './types';

export function fetchDashboardQuery(data: DashboardQueryRequest, signal?: AbortSignal): Promise<DashboardQueryResponse> {
  return request(`/api/${N9E_PATHNAME}/v2/query-batch`, {
    method: RequestMethod.Post,
    data,
    signal,
    silence: true,
  }).then((response) => response?.dat ?? response);
}
