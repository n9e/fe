import _ from 'lodash';

// 校验失败时把出错字段映射到所在分区；折叠分区内容是 display:none，必须先展开错误项才可见、才能被滚动定位
const FIELD_SECTION_MAP: Record<string, string> = {
  name: 'basic',
  group_id: 'basic',
  append_tags: 'basic',
  note: 'basic',
  cate: 'datasource',
  datasource_value: 'datasource',
  datasource_values: 'datasource',
  datasource_queries: 'datasource',
  datasource_ids: 'datasource',
  rule_config: 'rule', // event_relabel_config 子路径在 getErrorSectionKey 里单独映射到 pipeline
  notify_version: 'notify',
  notify_channels: 'notify',
  notify_groups: 'notify',
  notify_rule_ids: 'notify',
  notify_recovered: 'notify',
  recover_duration: 'notify',
  notify_repeat_step: 'notify',
  notify_max_number: 'notify',
  callbacks: 'notify',
  enable_status: 'effective',
  time_zone: 'effective',
  effective_time: 'effective',
  enable_in_bg: 'effective',
  pipeline_configs: 'pipeline',
  annotations: 'pipeline',
};

// extra_config 下的子字段分散在多个分区，按第二级路径映射
const EXTRA_CONFIG_SECTION_MAP: Record<string, string> = {
  custom_notify_tpl: 'notify',
  service_cal_configs: 'effective',
  enrich_queries: 'pipeline',
};

/** 返回出错字段所属的分区 key；未登记字段返回 undefined，调用方应走「全部展开」兜底 */
export default function getErrorSectionKey(namePath?: (string | number)[]): string | undefined {
  const first = _.toString(namePath?.[0]);
  if (first === 'rule_config' && _.toString(namePath?.[1]) === 'event_relabel_config') return 'pipeline';
  if (first === 'extra_config') return EXTRA_CONFIG_SECTION_MAP[_.toString(namePath?.[1])];
  return FIELD_SECTION_MAP[first];
}
