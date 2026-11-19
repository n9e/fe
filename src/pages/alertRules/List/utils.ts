import _ from 'lodash';

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

// 由独立产品维护的规则：规则本身的编辑、启停、删除都在产品页面完成，通用列表里只做只读展示
export const PRODUCT_RULE_PRODS = ['firemap', 'northstar'];

export function isProductRule(rule?: { prod?: string }): boolean {
  return PRODUCT_RULE_PRODS.includes(rule?.prod ?? '');
}

const isFilled = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

interface ProductRuleLike {
  id?: number | string;
  prod?: string;
  name?: string;
  rule_config?: any;
}

/** 灭火图 / 北极星规则的空间归属只认 rule_config.workspace_id，缺它就无法拼出产品详情页 */
export function hasProductRuleSpaceId(rule?: ProductRuleLike): boolean {
  return isFilled(rule?.rule_config?.workspace_id);
}

// 北极星规则名称格式：northstar/<业务线 ID>/<真实规则名>，业务线 ID 与真实名称都只存在于名称里
const NORTHSTAR_RULE_NAME_RE = /^northstar\/(\d+)(?:\/(.*))?$/;

function matchNorthstarRuleName(name?: string): RegExpMatchArray | null {
  return String(name ?? '')
    .trim()
    .match(NORTHSTAR_RULE_NAME_RE);
}

function getNorthstarBusinessId(name?: string): string | undefined {
  return matchNorthstarRuleName(name)?.[1];
}

/** 北极星规则名称 northstar/<业务线 ID>/<真实规则名> 里的真实规则名，解析不出时返回 undefined */
export function getNorthstarRuleName(name?: string): string | undefined {
  return matchNorthstarRuleName(name)?.[2]?.trim() || undefined;
}

/**
 * 灭火图 / 北极星规则的详情页路径：带回产品页时统一是 spaceId + alertRuleId。
 * 灭火图只依赖 rule_config.workspace_id；北极星还要从规则名称 northstar/<业务线 ID>/<规则名>
 * 里解析业务线 ID（与事件详情页的跳转格式保持一致）。
 * 缺少空间 ID 或解析不出业务线 ID 时返回 undefined，调用方据此降级为纯文本，避免拼出无效链接。
 */
export function getProductRulePath(rule?: ProductRuleLike): string | undefined {
  if (!rule || !isProductRule(rule) || rule.id === undefined || rule.id === null) return undefined;
  if (!hasProductRuleSpaceId(rule)) return undefined;

  const search = `spaceId=${encodeURIComponent(rule.rule_config.workspace_id)}&alertRuleId=${encodeURIComponent(rule.id)}`;
  if (rule.prod === 'firemap') return `/firemap?${search}`;
  if (rule.prod === 'northstar') {
    const businessId = getNorthstarBusinessId(rule.name);
    if (!businessId) return undefined;
    return `/polaris/${businessId}?${search}`;
  }
  return undefined;
}

// 查询语句所在字段：与规则摘要（FormNG/components/Sidebar/ruleConditionSummary.ts）的 QUERY_TEXT_KEYS 一致，另加 Elasticsearch/OpenSearch 的 filter
const QUERY_TEXT_KEYS = ['prom_ql', 'query', 'sql', 'promql', 'query_string', 'expression', 'filter'];

// 判断告警规则的名称、附加标签或查询语句是否包含搜索词（不区分大小写的子串匹配）
export function matchSearch(rule: Pick<AlertRuleType<any>, 'name' | 'append_tags' | 'rule_config'>, search?: string): boolean {
  const lowerCaseSearch = search?.toLowerCase() || '';
  const queryTexts = _.flatMap(rule.rule_config?.queries, (query) => _.map(QUERY_TEXT_KEYS, (key) => query?.[key]));
  return _.some([rule.name, _.join(rule.append_tags, ' '), ...queryTexts], (text) => typeof text === 'string' && text.toLowerCase().includes(lowerCaseSearch));
}
