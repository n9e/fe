import _ from 'lodash';

import type { AlertRuleType } from '@/pages/alertRules/types';
import type { NorthstarBusinessWorkspace } from '@/pages/alertRules/List/services';

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

/** 灭火图规则的空间归属只认 rule_config.workspace_id */
function hasFiremapSpaceId(rule?: ProductRuleLike): boolean {
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

function findNorthstarWorkspaceId(mapping: NorthstarBusinessWorkspace[] | undefined, businessId: string): string | undefined {
  const matched = _.find(mapping, (item) => String(item?.business_id) === businessId);
  if (!matched || !isFilled(matched.workspace_id)) return undefined;
  return String(matched.workspace_id);
}

export interface ProductRuleLink {
  /** 可跳转的产品页路径；无法生成时为空 */
  path?: string;
  /** 链接缺失是否因为取不到空间 ID（用于 hover 提示）；名称解析不出业务线不算缺空间 */
  missingSpace: boolean;
}

/**
 * 灭火图 / 北极星规则的详情页路径：带回产品页时统一是 spaceId + alertRuleId。
 * 灭火图的空间来自 rule_config.workspace_id；北极星的空间来自业务线 → 空间映射
 * （规则名称里只有业务线 ID，与事件详情页的跳转格式保持一致）。
 * 缺少空间 ID 时返回 missingSpace，调用方据此降级为纯文本并提示原因。
 */
export function getProductRuleLink(rule?: ProductRuleLike, northstarMapping?: NorthstarBusinessWorkspace[]): ProductRuleLink {
  if (!rule || !isProductRule(rule) || rule.id === undefined || rule.id === null) return { missingSpace: false };

  if (rule.prod === 'firemap') {
    if (!hasFiremapSpaceId(rule)) return { missingSpace: true };
    const search = `spaceId=${encodeURIComponent(rule.rule_config.workspace_id)}&alertRuleId=${encodeURIComponent(rule.id)}`;
    return { path: `/firemap?${search}`, missingSpace: false };
  }

  const businessId = getNorthstarBusinessId(rule.name);
  if (!businessId) return { missingSpace: false };
  const workspaceId = findNorthstarWorkspaceId(northstarMapping, businessId);
  if (!workspaceId) return { missingSpace: true };
  return {
    path: `/polaris/${businessId}?spaceId=${encodeURIComponent(workspaceId)}&alertRuleId=${encodeURIComponent(rule.id)}`,
    missingSpace: false,
  };
}

// 查询语句所在字段：与规则摘要（FormNG/components/Sidebar/ruleConditionSummary.ts）的 QUERY_TEXT_KEYS 一致，另加 Elasticsearch/OpenSearch 的 filter
const QUERY_TEXT_KEYS = ['prom_ql', 'query', 'sql', 'promql', 'query_string', 'expression', 'filter'];

// 规则 ID 精确匹配，名称、附加标签和查询语句按不区分大小写的子串匹配
export function matchSearch(rule: Pick<AlertRuleType<any>, 'id' | 'name' | 'append_tags' | 'rule_config'>, search?: string): boolean {
  if (search?.trim() === String(rule.id)) return true;
  const lowerCaseSearch = search?.toLowerCase() || '';
  const queryTexts = _.flatMap(rule.rule_config?.queries, (query) => _.map(QUERY_TEXT_KEYS, (key) => query?.[key]));
  return _.some([rule.name, _.join(rule.append_tags, ' '), ...queryTexts], (text) => typeof text === 'string' && text.toLowerCase().includes(lowerCaseSearch));
}
