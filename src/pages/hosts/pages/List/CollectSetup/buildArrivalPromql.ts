import _ from 'lodash';

/**
 * ident 是自由文本，进 PromQL 正则匹配串要过两层转义：先正则转义，再按
 * PromQL 字符串字面量规则（Go 转义）把反斜杠翻倍、引号加斜杠。顺序不可
 * 颠倒——单层 `\.` 入串会被 Prometheus 按未知转义序列拒绝解析，含 `.` 的
 * FQDN 主机名会让查询每轮都失败。
 */
function promRegex(value: string): string {
  return _.escapeRegExp(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export interface ArrivalPromqlOptions {
  /** 指标名前缀，如 mysql；只含 [a-z0-9_]（catalog 约束），可直接入串 */
  metricPrefix: string;
  /** 代表性指标精确名（如 mysql_up）；有值时用精确匹配，未定义回退前缀正则 */
  metric?: string;
  /** 目标机器 ident（自由文本），空则不限定机器 */
  idents?: string[];
}

/** 到达检测查询：精确指标只触达每机一条序列；前缀正则会展开组件全部指标，仅作兜底 */
export function buildArrivalPromql(options: ArrivalPromqlOptions): string {
  const { metricPrefix, metric } = options;
  const selected = _.compact(options.idents ?? []);
  const identMatcher = selected.length > 0 ? `ident=~"(${_.map(selected, promRegex).join('|')})"` : '';
  return metric
    ? `count by (ident) (${metric}{${identMatcher}})`
    : `count by (ident) ({__name__=~"${metricPrefix}_.+"${identMatcher ? `, ${identMatcher}` : ''}})`;
}
