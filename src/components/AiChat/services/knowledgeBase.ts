import { RequestMethod } from '@/store/common';
import request from '@/utils/request';

/**
 *
 * @param query
 * @param limit
 * @returns n9e业务列表
 */
export const getBusiGroups = (query?: string, limit: number = 1000, silence?: boolean) => {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
    ),
    silence,
  }).then((res) => res.dat);
};

// 大盘列表
export const getDashboards = (id: number | string, silence?: boolean) => {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Get,
    silence,
  }).then((res) => {
    return res.dat;
  });
};
