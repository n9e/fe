import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface NorthstarBusinessWorkspace {
  business_id: number | string;
  workspace_id: number | string;
}

/**
 * 北极星业务线 → 空间的映射。
 * 北极星告警规则名称里只有业务线 ID，跳转北极星详情页还需要空间 ID，只能靠这份映射换出来。
 */
export const getNorthstarBusinessWorkspaceMapping = function () {
  return request('/api/v1/northstar/business/workspace/mapping', {
    method: RequestMethod.Get,
    // 映射只用于拼跳转链接，失败时不打断列表，降级为纯文本
    silence: true,
  }).then((res) => res?.data ?? []);
};
