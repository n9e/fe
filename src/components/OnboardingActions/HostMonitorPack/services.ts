import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

/**
 * 导入告警规则。有意不带 `force=true`：force 走后端按 (group_id, name) 的整行覆盖
 * （alertRuleUpsert → Update 是 Select("*").Updates），会把用户改过阈值、主动停用、
 * 换过通知绑定的同名规则静默还原；且内置模板的 name 随 X-Language 翻译，换语言后
 * 同名判定必然落空、反而导入第二套规则。「可重复执行」由调用方预查同名并跳过来实现，
 * 与大盘路径同一口径；预查漏网的重名由后端拒绝（"AlertRule already exists"），
 * 展示为失败但不覆盖任何既有配置。
 *
 * silence 交给调用方渲染逐条结果，不弹全局 toast。
 */
export function importAlertRules(bgid: number, data: unknown[]): Promise<Record<string, string>> {
  return request(`/api/n9e/busi-group/${bgid}/alert-rules/import`, {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat ?? {});
}
