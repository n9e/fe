import { LabelMatcher, LabelName, MatchOp, MetricIdentifier, parser, StringLiteral } from 'lezer-promql';

type JsonRecord = Record<string, unknown>;

export interface MetricCoverage {
  hit: number;
  total: number;
  covered: string[];
  missing: string[];
  ratio: number;
}

const PROMQL_TEMPLATE_PLACEHOLDER = 'codex_promql_template_variable';
const hasPromQLTemplatePlaceholder = (metric: string) => metric.includes(PROMQL_TEMPLATE_PLACEHOLDER);

const asRecord = (value: unknown): JsonRecord | undefined => (value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : undefined);

const parseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return undefined;
  }
};

/** 提取 PromQL 中真正引用的指标名。模板变量先替换成合法标识符，避免破坏整棵语法树。 */
export function extractPromQLMetrics(expr: string): string[] {
  if (!expr) return [];

  const normalizedExpr = expr.replace(/\$\{[a-zA-Z_][a-zA-Z0-9_]*\}|\$[a-zA-Z_][a-zA-Z0-9_]*/g, PROMQL_TEMPLATE_PLACEHOLDER);
  const tree = parser.parse(normalizedExpr);
  const metrics = new Set<string>();

  const visit = (node: typeof tree.topNode) => {
    if (node.type.id === MetricIdentifier) {
      const metric = normalizedExpr.slice(node.from, node.to);
      if (metric && !hasPromQLTemplatePlaceholder(metric)) metrics.add(metric);
    }

    if (node.type.id === LabelMatcher) {
      const labelNode = node.getChild(LabelName);
      const opNode = node.getChild(MatchOp);
      const valueNode = node.getChild(StringLiteral);
      if (labelNode && opNode && valueNode && normalizedExpr.slice(labelNode.from, labelNode.to) === '__name__' && normalizedExpr.slice(opNode.from, opNode.to) === '=') {
        const rawValue = normalizedExpr.slice(valueNode.from, valueNode.to);
        const quote = rawValue[0];
        const metric = rawValue.slice(1, -1).replace(/\\([\\"'])/g, '$1');
        if ((quote === '"' || quote === "'") && metric && !hasPromQLTemplatePlaceholder(metric)) metrics.add(metric);
      }
    }

    let child = node.firstChild;
    while (child) {
      visit(child);
      child = child.nextSibling;
    }
  };

  visit(tree.topNode);
  return Array.from(metrics);
}

/** 提取仪表盘 configs.panels 中所有查询指标，包含 row 面板折叠保存的 panels。 */
export function extractDashboardMetrics(board: unknown): string[] {
  const dashboard = asRecord(parseJson(board));
  const configs = asRecord(parseJson(dashboard?.configs));
  const metrics = new Set<string>();

  const visitPanels = (panels: unknown) => {
    if (!Array.isArray(panels)) return;
    panels.forEach((panelValue) => {
      const panel = asRecord(panelValue);
      if (!panel) return;

      if (Array.isArray(panel.targets)) {
        panel.targets.forEach((targetValue) => {
          const target = asRecord(targetValue);
          if (typeof target?.expr === 'string') {
            extractPromQLMetrics(target.expr).forEach((metric) => metrics.add(metric));
          }
        });
      }

      visitPanels(panel.panels);
    });
  };

  visitPanels(configs?.panels);
  return Array.from(metrics);
}

/** 提取告警 rule_config.queries[].prom_ql 中所有指标。 */
export function extractAlertRuleMetrics(rule: unknown): string[] {
  const alert = asRecord(parseJson(rule));
  const ruleConfig = asRecord(parseJson(alert?.rule_config));
  const metrics = new Set<string>();
  const queries = ruleConfig?.queries;

  if (Array.isArray(queries)) {
    queries.forEach((queryValue) => {
      const query = asRecord(queryValue);
      if (typeof query?.prom_ql === 'string') {
        extractPromQLMetrics(query.prom_ql).forEach((metric) => metrics.add(metric));
      }
    });
  }

  return Array.from(metrics);
}

/** 覆盖率以模板 PromQL 实际引用的唯一指标为分母。 */
export function computeCoverage(providedMetrics: string[], requiredMetrics: string[]): MetricCoverage {
  const provided = new Set(providedMetrics);
  const required = Array.from(new Set(requiredMetrics));
  const covered = required.filter((metric) => provided.has(metric));
  const missing = required.filter((metric) => !provided.has(metric));
  const hit = covered.length;

  return {
    hit,
    total: required.length,
    covered,
    missing,
    ratio: required.length ? hit / required.length : 0,
  };
}

export function isFullyCovered(coverage: MetricCoverage): boolean {
  return coverage.total > 0 && coverage.hit === coverage.total;
}

export function hasAnyCoverage(coverage: MetricCoverage): boolean {
  return coverage.hit > 0;
}
