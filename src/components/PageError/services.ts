import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

/**
 * 查管理员列表，用于 403 页面回答「该找谁要权限」。
 *
 * 只在后端没有随 403 返回 owners 时兜底。这个接口不一定存在（开源版没有 /api/v1），
 * 所以带 silence 走静默失败，调用方 catch 掉即可。
 */
export function getAdminList(): Promise<string[]> {
  return request('/api/v1/system/users/admin', {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => _.compact(_.map(res?.data ?? res?.dat, (item: any) => item?.nickname || item?.username)));
}
