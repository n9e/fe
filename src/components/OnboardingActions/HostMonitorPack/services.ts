import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

/**
 * 导入告警规则，带 `force=true` 走后端的 upsert（按 group_id + name），让「一键启用」可以重复执行。
 *
 * 集成中心的 createRule 没传这个参数，重名会直接返回 "AlertRule already exists"，
 * 所以这里单独封一层。silence 交给调用方渲染逐条结果，不弹全局 toast。
 */
export function importAlertRules(bgid: number, data: unknown[]): Promise<Record<string, string>> {
  return request(`/api/n9e/busi-group/${bgid}/alert-rules/import?force=true`, {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat ?? {});
}
