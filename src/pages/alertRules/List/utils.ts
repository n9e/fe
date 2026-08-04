import type { AlertRuleType } from '@/pages/alertRules/types';

export const downloadFile = (data = '', filename = 'export.csv') => {
  let body = document.body;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob(['\ufeff' + data], {
      type: 'text/csv;charset=utf-8;',
    }),
  );
  a.setAttribute('download', filename);
  body.appendChild(a);
  a.click();
  body.removeChild(a);
};

export type TriggerType = 'threshold' | 'nodata' | 'anomaly';

// 告警条件类型选项；label 为 locale 键（filter_trigger_type.*）
export const TRIGGER_TYPE_OPTIONS = [
  { label: 'threshold', value: 'threshold' },
  { label: 'nodata', value: 'nodata' },
  { label: 'anomaly', value: 'anomaly' },
] as const;

// 判断告警规则是否匹配指定的告警条件类型（纯函数、幂等、不改入参）
export function matchTriggerType(rule: Pick<AlertRuleType<any>, 'rule_config'> | undefined, triggerType?: TriggerType): boolean {
  if (!triggerType) return true;
  const config = rule?.rule_config;
  switch (triggerType) {
    case 'threshold':
      // 未禁用阈值判断（exp_trigger_disable 不为 true）即视为阈值告警
      return config?.exp_trigger_disable !== true;
    case 'nodata':
      return config?.nodata_trigger?.enable === true;
    case 'anomaly':
      return config?.anomaly_trigger?.enable === true;
    default:
      return true;
  }
}
