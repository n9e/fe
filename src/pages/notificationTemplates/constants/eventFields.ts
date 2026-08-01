/**
 * 模板里可引用的告警事件字段。
 *
 * 此前这份清单只以 markdown 表格的形式躺在右侧文档里：不能搜、不能复制、四十多个字段要一路滚。
 * 现在改为结构化数据，供字段面板（搜索 + 说明 + 点击复制）使用；后续编辑器的自动补全也复用同一份，
 * 避免两处各自演化。原文档中的「可用字段说明」一节已随之删除，避免同一份信息两处维护。
 *
 * type 与语言无关放在这里；描述走 i18n：fields_panel.fields.{key}
 */

export interface EventField {
  /** 模板中的引用表达式，直接可复制粘贴 */
  ref: string;
  /** i18n key 后缀，用于取字段说明 */
  key: string;
  /** 字段类型，语言无关 */
  type: string;
}

export interface EventFieldGroup {
  /** 分组名走 i18n：fields_panel.groups.{key} */
  key: string;
  fields: EventField[];
}

export const EVENT_FIELD_GROUPS: EventFieldGroup[] = [
  {
    key: 'common',
    fields: [
      { ref: '{{$event}}', key: 'event', type: 'object' },
      { ref: '{{$labels}}', key: 'labels', type: 'map[string]string' },
      { ref: '{{$value}}', key: 'value', type: 'string' },
      { ref: '{{$domain}}', key: 'domain', type: 'string' },
      { ref: '{{timestamp}}', key: 'timestamp', type: 'string' },
      { ref: '{{timeformat $event.LastEvalTime}}', key: 'timeformat', type: 'func' },
    ],
  },
  {
    key: 'basic',
    fields: [
      { ref: '{{$event.Id}}', key: 'Id', type: 'int64' },
      { ref: '{{$event.Cate}}', key: 'Cate', type: 'string' },
      { ref: '{{$event.Cluster}}', key: 'Cluster', type: 'string' },
      { ref: '{{$event.DatasourceId}}', key: 'DatasourceId', type: 'int64' },
      { ref: '{{$event.GroupId}}', key: 'GroupId', type: 'int64' },
      { ref: '{{$event.GroupName}}', key: 'GroupName', type: 'string' },
      { ref: '{{$event.Hash}}', key: 'Hash', type: 'string' },
      { ref: '{{$event.RuleId}}', key: 'RuleId', type: 'int64' },
      { ref: '{{$event.RuleName}}', key: 'RuleName', type: 'string' },
      { ref: '{{$event.RuleNote}}', key: 'RuleNote', type: 'string' },
      { ref: '{{$event.RuleHash}}', key: 'RuleHash', type: 'string' },
      { ref: '{{$event.Severity}}', key: 'Severity', type: 'int' },
      { ref: '{{$event.Status}}', key: 'Status', type: 'int' },
      { ref: '{{$event.PromQl}}', key: 'PromQl', type: 'string' },
      { ref: '{{$event.PromForDuration}}', key: 'PromForDuration', type: 'int' },
      { ref: '{{$event.PromEvalInterval}}', key: 'PromEvalInterval', type: 'int' },
      { ref: '{{$event.SubRuleId}}', key: 'SubRuleId', type: 'int64' },
    ],
  },
  {
    key: 'trigger',
    fields: [
      { ref: '{{$event.TriggerTime}}', key: 'TriggerTime', type: 'int64' },
      { ref: '{{$event.TriggerValue}}', key: 'TriggerValue', type: 'string' },
      { ref: '{{$event.TriggerValues}}', key: 'TriggerValues', type: 'string' },
      { ref: '{{$event.FirstTriggerTime}}', key: 'FirstTriggerTime', type: 'int64' },
      { ref: '{{$event.IsRecovered}}', key: 'IsRecovered', type: 'bool' },
      { ref: '{{$event.NotifyCurNumber}}', key: 'NotifyCurNumber', type: 'int' },
      { ref: '{{$event.LastEvalTime}}', key: 'LastEvalTime', type: 'int64' },
      { ref: '{{$event.LastSentTime}}', key: 'LastSentTime', type: 'int64' },
    ],
  },
  {
    key: 'tags',
    fields: [
      { ref: '{{$event.TagsJSON}}', key: 'TagsJSON', type: '[]string' },
      { ref: '{{$event.TagsMap}}', key: 'TagsMap', type: 'map[string]string' },
      { ref: '{{$event.TagsMap.instance}}', key: 'TagsMap_instance', type: 'string' },
      { ref: '{{$event.AnnotationsJSON}}', key: 'AnnotationsJSON', type: 'map[string]string' },
      { ref: '{{$event.AnnotationsJSON.summary}}', key: 'AnnotationsJSON_summary', type: 'string' },
    ],
  },
  {
    key: 'target',
    fields: [
      { ref: '{{$event.TargetIdent}}', key: 'TargetIdent', type: 'string' },
      { ref: '{{$event.TargetNote}}', key: 'TargetNote', type: 'string' },
    ],
  },
  {
    key: 'notify',
    fields: [
      { ref: '{{$event.NotifyRecovered}}', key: 'NotifyRecovered', type: 'int' },
      { ref: '{{$event.NotifyChannelsJSON}}', key: 'NotifyChannelsJSON', type: '[]string' },
      { ref: '{{$event.NotifyGroupsJSON}}', key: 'NotifyGroupsJSON', type: '[]string' },
      { ref: '{{$event.NotifyRuleIDs}}', key: 'NotifyRuleIDs', type: '[]int64' },
    ],
  },
  {
    key: 'extra',
    fields: [
      { ref: '{{$event.CallbacksJSON}}', key: 'CallbacksJSON', type: '[]string' },
      { ref: '{{$event.ExtraConfig}}', key: 'ExtraConfig', type: 'interface{}' },
      { ref: '{{$event.ExtraInfo}}', key: 'ExtraInfo', type: '[]string' },
      { ref: '{{$event.ExtraInfoMap}}', key: 'ExtraInfoMap', type: '[]map[string]string' },
    ],
  },
];

/**
 * 按关键字过滤字段。匹配引用表达式，也匹配传入的说明文案
 * （调用方把已翻译的说明传进来，让「规则名称」这种中文搜索也能命中）。
 */
export function filterFieldGroups(groups: EventFieldGroup[], search: string, getDesc?: (field: EventField) => string): EventFieldGroup[] {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return groups;

  const result: EventFieldGroup[] = [];
  for (const group of groups) {
    const fields = group.fields.filter((field) => {
      if (field.ref.toLowerCase().includes(keyword)) return true;
      const desc = getDesc?.(field);
      return !!desc && desc.toLowerCase().includes(keyword);
    });
    if (fields.length) {
      result.push({ key: group.key, fields });
    }
  }
  return result;
}
