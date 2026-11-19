import { DASHBOARD_VERSION } from '@/pages/dashboard/constants';

const SCALAR_INTERVAL = 315360000;

type JsonRecord = Record<string, unknown>;

interface IndexPattern {
  index: string;
  dateField: string;
}

interface TermsSpec {
  field: string;
  size: number;
  order: 'asc' | 'desc';
  orderBy: '_key' | '_count';
}

interface ColumnSpec {
  id: string;
  operation: string;
  field?: string;
  label?: string;
  params: JsonRecord;
}

type FormulaNode =
  | { type: 'number'; value: number }
  | { type: 'agg'; func: string; field?: string; kql?: string }
  | { type: 'binary'; op: '+' | '-' | '*' | '/'; left: FormulaNode; right: FormulaNode };

interface MetricSpec {
  func: string;
  field?: string;
  label?: string;
  unit?: string;
  decimals?: number;
  formula?: FormulaNode;
}

interface FilterPlan {
  language: 'kql' | 'lucene';
  dslFilter: string;
}

interface QueryTarget {
  refId: string;
  kind: 'query' | 'expression';
  resultType?: 'time_series' | 'logs';
  query?: JsonRecord;
  datasource?: { cate: string; id: string };
  legend?: string;
  hide?: boolean;
  expression?: string;
}

interface FlashcatPanel {
  type: string;
  name: string;
  description: string;
  custom: JsonRecord;
  options: JsonRecord;
  targets: QueryTarget[];
  overrides: JsonRecord[];
  transformationsNG?: JsonRecord[];
  id?: string;
  layout?: JsonRecord;
  datasourceCate?: string;
  datasourceValue?: string;
}

export interface KibanaDashboardImport {
  name: string;
  tags: string;
  note: string;
  configs: {
    version: string;
    graphTooltip: 'default' | 'sharedCrosshair' | 'sharedTooltip';
    var: JsonRecord[];
    panels: FlashcatPanel[];
  };
}

export interface KibanaImportResult {
  dashboard: KibanaDashboardImport;
  warnings: string[];
}

export interface KibanaImportOptions {
  defaultDatasourceId?: number;
}

class FormulaError extends Error {}

function isRecord(value: unknown): value is JsonRecord {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseEmbedded(value: unknown): JsonRecord | undefined {
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return undefined;
    try {
      value = JSON.parse(text) as unknown;
    } catch {
      return undefined;
    }
  }
  return asRecord(value);
}

class FormulaParser {
  private index = 0;

  constructor(private readonly text: string) {}

  parse(): FormulaNode {
    const node = this.expression();
    this.skip();
    if (this.index !== this.text.length) {
      throw new FormulaError(`公式无法解析: ${this.text}`);
    }
    return node;
  }

  private skip() {
    while (this.index < this.text.length && /\s/.test(this.text[this.index])) this.index += 1;
  }

  private expression(): FormulaNode {
    let node = this.term();
    while (true) {
      this.skip();
      const op = this.text[this.index];
      if (op !== '+' && op !== '-') break;
      this.index += 1;
      node = { type: 'binary', op, left: node, right: this.term() };
    }
    return node;
  }

  private term(): FormulaNode {
    let node = this.unary();
    while (true) {
      this.skip();
      const op = this.text[this.index];
      if (op !== '*' && op !== '/') break;
      this.index += 1;
      node = { type: 'binary', op, left: node, right: this.unary() };
    }
    return node;
  }

  private unary(): FormulaNode {
    this.skip();
    if (this.index >= this.text.length) throw new FormulaError('公式不完整');
    const ch = this.text[this.index];
    if (ch === '(') {
      this.index += 1;
      const node = this.expression();
      this.skip();
      if (this.text[this.index] !== ')') throw new FormulaError('公式缺少右括号');
      this.index += 1;
      return node;
    }
    if (/\d|\./.test(ch)) {
      const start = this.index;
      while (this.index < this.text.length && /[\d.]/.test(this.text[this.index])) this.index += 1;
      return { type: 'number', value: Number(this.text.slice(start, this.index)) };
    }
    const start = this.index;
    while (this.index < this.text.length && /[A-Za-z0-9_]/.test(this.text[this.index])) this.index += 1;
    const name = this.text.slice(start, this.index);
    if (!name) throw new FormulaError(`公式无法解析: ${this.text.slice(this.index)}`);
    this.skip();
    if (this.text[this.index] === '(') {
      this.index += 1;
      const args = this.args();
      return { type: 'agg', func: name === 'average' ? 'avg' : name, field: args.field, kql: args.kql };
    }
    throw new FormulaError(`不支持的公式片段: ${name}`);
  }

  private args(): { field?: string; kql?: string } {
    const result: { field?: string; kql?: string } = {};
    this.skip();
    if (this.text[this.index] === ')') {
      this.index += 1;
      return result;
    }
    while (true) {
      this.skip();
      const start = this.index;
      while (this.index < this.text.length && /[A-Za-z0-9_.]/.test(this.text[this.index])) this.index += 1;
      const token = this.text.slice(start, this.index);
      this.skip();
      if (this.text[this.index] === '=') {
        this.index += 1;
        this.skip();
        const quote = this.text[this.index];
        if (quote !== "'" && quote !== '"') throw new FormulaError('公式参数缺少引号');
        this.index += 1;
        let value = '';
        while (this.index < this.text.length && this.text[this.index] !== quote) {
          if (this.text[this.index] === '\\' && this.index + 1 < this.text.length) this.index += 1;
          value += this.text[this.index];
          this.index += 1;
        }
        if (this.index >= this.text.length) throw new FormulaError('公式参数引号没有闭合');
        this.index += 1;
        if (token === 'kql') result.kql = value;
        else result.field = value;
      } else if (token) {
        result.field = token;
      }
      this.skip();
      if (this.text[this.index] === ',') {
        this.index += 1;
        continue;
      }
      if (this.text[this.index] === ')') {
        this.index += 1;
        return result;
      }
      throw new FormulaError('公式参数无法解析');
    }
  }
}

function walkExpression(node: FormulaNode, queries: Extract<FormulaNode, { type: 'agg' }>[]): string {
  if (node.type === 'number') return String(node.value);
  if (node.type === 'agg') {
    queries.push(node);
    return `$${String.fromCharCode(65 + queries.length - 1)}`;
  }
  return `(${walkExpression(node.left, queries)} ${node.op} ${walkExpression(node.right, queries)})`;
}

export function convertKibanaNdjson(raw: string, options: KibanaImportOptions = {}): KibanaImportResult {
  const warnings: string[] = [];
  const warnOnce = (message: string) => {
    if (!warnings.includes(message)) warnings.push(message);
  };
  const objects = parseObjects(raw);
  const dashboards = objects.filter((item) => item.type === 'dashboard');
  if (!dashboards.length) throw new Error('NDJSON 里没有 dashboard');
  if (dashboards.length > 1) {
    warnings.push(`NDJSON 里有多个仪表盘，使用第一个: ${asString(asRecord(dashboards[0].attributes)?.title)}`);
  }
  const dashboard = dashboards[0];
  const attributes = asRecord(dashboard.attributes) ?? {};
  const patterns = new Map<string, IndexPattern>();
  const saved = new Map<string, JsonRecord>();
  objects.forEach((item) => {
    const id = asString(item.id);
    if (item.type === 'index-pattern' && id) {
      const attrs = asRecord(item.attributes) ?? {};
      patterns.set(id, { index: asString(attrs.title) || '*', dateField: asString(attrs.timeFieldName) || '@timestamp' });
    } else if (id && (item.type === 'lens' || item.type === 'search' || item.type === 'visualization' || item.type === 'links')) {
      saved.set(id, item);
    }
  });

  const layout = readLayout(attributes, dashboard.references, warnings);
  const panels: FlashcatPanel[] = [];
  const rightEdge = layout.panels.reduce((max, panel) => Math.max(max, panel.x + panel.w), 0);
  const scale = rightEdge > 24 ? 24 / rightEdge : 1;
  const unsupported = new Set(['map', 'graph-workspace', 'canvas-workpad', 'canvas', 'ml', 'vega']);

  layout.panels.forEach((panel) => {
    if (unsupported.has(panel.kind)) {
      warnings.push(`面板 ${panel.id} 是 ${panel.kind}，没有对应图表`);
      return;
    }
    const obj = panel.refId ? saved.get(panel.refId) : undefined;
    let converted: FlashcatPanel | undefined;
    try {
      if (!obj) {
        warnings.push(`缺少 saved object ${panel.refId || panel.id}`);
        return;
      }
      if (obj.type === 'search' || panel.kind === 'search') {
        converted = convertSearch(obj, patterns, warnings);
      } else if (obj.type === 'lens' || panel.kind === 'lens' || panel.kind === 'vis') {
        converted = convertLens(obj, patterns, warnings, warnOnce, layout.filter, layout.language);
      } else {
        warnings.push(`面板 ${panel.id} 是 ${asString(obj.type) || panel.kind}，没有对应图表`);
        return;
      }
    } catch (error) {
      warnings.push(`${panel.id}: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    if (!converted) return;
    converted.targets.forEach((target) => {
      if (target.kind !== 'expression') target.datasource = { cate: 'elasticsearch', id: '${datasource}' };
    });
    const width = Math.min(Math.max(1, Math.round(panel.w * scale)), 24);
    converted.id = panel.id;
    converted.layout = { x: Math.round(panel.x * scale), y: panel.y, w: width, h: Math.max(panel.h, 4), i: panel.id };
    converted.datasourceCate = 'elasticsearch';
    converted.datasourceValue = '${datasource}';
    panels.push(converted);
  });

  const datasourceVar: JsonRecord = {
    type: 'datasource',
    name: 'datasource',
    label: '数据源',
    definition: 'elasticsearch',
    hide: false,
    datasource: { cate: 'elasticsearch' },
  };
  if (typeof options.defaultDatasourceId === 'number' && Number.isFinite(options.defaultDatasourceId)) {
    datasourceVar.defaultValue = options.defaultDatasourceId;
  }
  const note = [
    asString(attributes.description),
    layout.timeFrom || layout.timeTo ? `Kibana 原时间范围是 ${layout.timeFrom} 到 ${layout.timeTo}。导入后不锁定面板时间，查询跟随时间选择器。` : '',
    panels.some((panel) => panel.targets.some((target) => target.query?.syntax === 'sql'))
      ? '查询使用 Elasticsearch DSL。没有分组的去重计数使用 SQL 的 COUNT(DISTINCT)，时间跟随时间选择器。'
      : '查询全部使用 Elasticsearch DSL，时间跟随时间选择器。',
    '数据源使用仪表盘变量，可在页面上切换 Elasticsearch 数据源。',
    warnings.some((item) => item.includes('饼图百分比')) ? '饼图百分比在浏览器导入时只改标签。提示和环形中心仍显示数量。' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    dashboard: {
      name: asString(attributes.title) || 'Kibana 仪表盘',
      tags: '',
      note,
      configs: {
        version: DASHBOARD_VERSION,
        graphTooltip: layout.syncTooltips ? 'sharedTooltip' : layout.syncCursor ? 'sharedCrosshair' : 'default',
        var: [datasourceVar],
        panels,
      },
    },
    warnings,
  };
}

function parseObjects(raw: string): JsonRecord[] {
  const text = raw.trim();
  if (!text) throw new Error('NDJSON 是空的');
  return text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      throw new Error('NDJSON 有一行不是 JSON');
    }
    return isRecord(parsed) && parsed.type ? [parsed] : [];
  });
}

interface LayoutPanel {
  id: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  refId?: string;
}

function readLayout(attributes: JsonRecord, references: unknown, warnings: string[]) {
  const refs = Array.isArray(references) ? references.filter(isRecord) : [];
  const byName = new Map(refs.map((item) => [asString(item.name), item]));
  let parsed: unknown = attributes.panelsJSON;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed || '[]') as unknown;
    } catch {
      throw new Error('panelsJSON 不是 JSON');
    }
  }
  const list = Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  const layoutPanels: LayoutPanel[] = [];
  list.forEach((panel) => {
    const grid = asRecord(panel.gridData) ?? {};
    const panelIndex = asString(panel.panelIndex) || asString(grid.i);
    const ref = byName.get(`${panelIndex}:savedObjectRef`);
    if (!asString(ref?.id)) {
      warnings.push(`面板 ${panelIndex || '未命名'} 没有引用，已跳过`);
      return;
    }
    layoutPanels.push({
      id: panelIndex,
      kind: asString(panel.type) || asString(ref?.type) || 'lens',
      x: numberOf(grid.x),
      y: numberOf(grid.y),
      w: numberOf(grid.w) || 12,
      h: numberOf(grid.h) || 8,
      refId: asString(ref?.id),
    });
  });
  const options = parseEmbedded(attributes.optionsJSON) ?? {};
  const source = parseEmbedded(asRecord(attributes.kibanaSavedObjectMeta)?.searchSourceJSON) ?? {};
  const query = asRecord(source.query) ?? {};
  return {
    panels: layoutPanels,
    filter: asString(query.query).trim(),
    language: languageOf(asString(query.language)),
    timeFrom: asString(attributes.timeFrom),
    timeTo: asString(attributes.timeTo),
    syncCursor: Boolean(options.syncCursor),
    syncTooltips: Boolean(options.syncTooltips),
  };
}

function numberOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function numericParam(column: ColumnSpec | undefined, fallback = 0): number {
  const value = column?.params.value;
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function firstArrayId(value: unknown): string | undefined {
  return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : undefined;
}

function languageOf(language: string): 'kql' | 'lucene' {
  return language === 'lucene' ? 'lucene' : 'kql';
}

function indexOf(obj: JsonRecord, patterns: Map<string, IndexPattern>, warnings: string[]): IndexPattern {
  const refs = Array.isArray(obj.references) ? obj.references.filter(isRecord) : [];
  const found = refs.find((item) => item.type === 'index-pattern' && patterns.has(asString(item.id)));
  const pattern = found ? patterns.get(asString(found.id)) : undefined;
  if (pattern) return pattern;
  warnings.push(`${asString(asRecord(obj.attributes)?.title) || asString(obj.id)} 没有关联索引模式`);
  return { index: '*', dateField: '@timestamp' };
}

function readColumns(layer: JsonRecord): ColumnSpec[] {
  const columns = asRecord(layer.columns) ?? {};
  const order = Array.isArray(layer.columnOrder) ? layer.columnOrder.map(asString) : Object.keys(columns);
  return order.flatMap((id) => {
    const column = asRecord(columns[id]);
    if (!column) return [];
    return [
      {
        id,
        operation: asString(column.operationType),
        field: asString(column.sourceField) || undefined,
        label: asString(column.label) || undefined,
        params: asRecord(column.params) ?? {},
      },
    ];
  });
}

function columnById(columns: ColumnSpec[], id: unknown): ColumnSpec | undefined {
  const key = asString(id);
  return key ? columns.find((column) => column.id === key) : undefined;
}

function readTerms(column?: ColumnSpec): TermsSpec | undefined {
  if (!column || column.operation !== 'terms' || !column.field) return undefined;
  const orderBy = asRecord(column.params.orderBy);
  const size = column.params.size;
  return {
    field: column.field,
    size: typeof size === 'number' ? size : 10,
    order: column.params.orderDirection === 'asc' ? 'asc' : 'desc',
    orderBy: orderBy?.type === 'alphabetical' ? '_key' : '_count',
  };
}

function formatOf(params: JsonRecord): { unit?: string; decimals?: number } {
  const format = asRecord(params.format) ?? {};
  const formatParams = asRecord(format.params) ?? {};
  const unit = format.id === 'percent' ? 'percentUnit' : format.id === 'bytes' ? 'bytesIEC' : undefined;
  const decimals = typeof formatParams.decimals === 'number' ? formatParams.decimals : undefined;
  return { unit, decimals };
}

function metricOf(column: ColumnSpec): MetricSpec {
  if (column.operation === 'static_value') throw new FormulaError('静态值暂不支持');
  const formatted = formatOf(column.params);
  if (column.operation === 'formula') {
    const formula = new FormulaParser(asString(column.params.formula)).parse();
    return {
      func: formula.type === 'agg' ? formula.func : 'count',
      field: formula.type === 'agg' ? formula.field : undefined,
      label: column.label,
      formula,
      ...formatted,
    };
  }
  if (column.operation === 'count') return { func: 'count', label: column.label, ...formatted };
  if (column.operation === 'unique_count') return { func: 'unique_count', field: column.field, label: column.label, ...formatted };
  const mapping: Record<string, string> = { average: 'avg', sum: 'sum', min: 'min', max: 'max', median: 'median' };
  if (mapping[column.operation]) return { func: mapping[column.operation], field: column.field, label: column.label, ...formatted };
  if (column.operation === 'percentile') {
    const percentile = typeof column.params.percentile === 'number' ? column.params.percentile : 95;
    const func = ({ 50: 'median', 90: 'p90', 95: 'p95', 99: 'p99' } as Record<number, string>)[percentile];
    if (!func) throw new FormulaError(`百分位 ${percentile} 不在 50/90/95/99 内`);
    return { func, field: column.field, label: column.label, ...formatted };
  }
  throw new FormulaError(`聚合 ${column.operation} 暂不支持`);
}

function quoteSqlIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

function uniqueCountSql(index: IndexPattern, field: string, filter: string): JsonRecord {
  const timeField = quoteSqlIdent(index.dateField);
  let where = `${timeField} >= '\${__from_date_iso}' AND ${timeField} < '\${__to_date_iso}'`;
  if (filter) where += ` AND QUERY('${filter.replace(/'/g, "''")}')`;
  return {
    syntax: 'sql',
    mode: 'timeSeries',
    editMode: 'code',
    sql: `SELECT COUNT(DISTINCT ${quoteSqlIdent(field)}) AS ${quoteSqlIdent('value')} FROM ${quoteSqlIdent(index.index)} WHERE ${where}`,
    keys: { valueKey: ['value'] },
  };
}

function dslValue(metric: MetricSpec, warnOnce: (message: string) => void): JsonRecord | undefined {
  let func = metric.func || 'count';
  if (func === 'unique_count') {
    warnOnce('带分组的去重计数写成 DSL 的 cardinality，当前查询服务不返回这类结果');
    func = 'cardinality';
  }
  if (func === 'median') {
    warnOnce('中位数写不进 DSL，已跳过');
    return undefined;
  }
  if (func === 'count') return { func: 'count' };
  if (!metric.field) {
    warnOnce(`聚合 ${func} 缺少字段，已跳过`);
    return undefined;
  }
  return { func, field: metric.field };
}

function dslQuery(
  index: IndexPattern,
  plan: FilterPlan,
  metric: MetricSpec,
  terms: TermsSpec[],
  scalar: boolean,
  warnOnce: (message: string) => void,
  fixedInterval?: number,
): JsonRecord | undefined {
  const value = dslValue(metric, warnOnce);
  if (!value) return undefined;
  const query: JsonRecord = {
    index_type: 'index',
    index: index.index,
    date_field: index.dateField,
    filter: plan.dslFilter,
    filter_language: plan.language,
    syntax: 'dsl',
    values: [value],
  };
  if (terms.length) {
    query.group_by = terms.map((item) => ({
      cate: 'terms',
      field: item.field,
      size: item.size,
      min_doc_count: 1,
      order: item.order,
      order_by: item.orderBy,
    }));
  }
  if (fixedInterval) {
    query.interval = fixedInterval;
    query.interval_unit = 'second';
  } else if (scalar) {
    query.interval = SCALAR_INTERVAL;
    query.interval_unit = 'second';
  }
  return query;
}

function queryTarget(refId: string, query: JsonRecord | undefined, legend?: string, hide = false): QueryTarget | undefined {
  if (!query) return undefined;
  const target: QueryTarget = { refId, kind: 'query', resultType: 'time_series', query };
  if (legend) target.legend = legend;
  if (hide) target.hide = true;
  return target;
}

function buildTargets(
  index: IndexPattern,
  plan: FilterPlan,
  metric: MetricSpec,
  terms: TermsSpec[],
  scalar: boolean,
  warnOnce: (message: string) => void,
  warnings: string[],
  fixedInterval?: number,
): QueryTarget[] {
  const formula = metric.formula;
  if (formula && formula.type !== 'agg') {
    const parts: Extract<FormulaNode, { type: 'agg' }>[] = [];
    const expression = walkExpression(formula, parts);
    const targets: QueryTarget[] = [];
    for (let indexNo = 0; indexNo < parts.length; indexNo += 1) {
      const part = parts[indexNo];
      let partFilter = plan.dslFilter;
      if (part.kql) {
        const joiner = plan.language === 'lucene' ? ' AND ' : ' and ';
        partFilter = [partFilter, part.kql].filter(Boolean).join(joiner);
      }
      const partPlan = { ...plan, dslFilter: partFilter };
      const query =
        part.func === 'unique_count' && !terms.length && part.field
          ? (warnOnce('去重计数写成 SQL 的 COUNT(DISTINCT)'), uniqueCountSql(index, part.field, partFilter))
          : dslQuery(index, partPlan, { func: part.func, field: part.field }, terms, scalar, warnOnce, fixedInterval);
      const target = queryTarget(String.fromCharCode(65 + indexNo), query, undefined, true);
      if (!target) {
        warnings.push(`${metric.label || '指标'} 的公式写不进 DSL，已跳过`);
        return [];
      }
      targets.push(target);
    }
    targets.push({ refId: String.fromCharCode(65 + parts.length), kind: 'expression', expression, legend: metric.label });
    warnings.push('Lens 公式拆成过滤查询和表达式');
    return targets;
  }
  let simple = metric;
  let filter = plan.dslFilter;
  if (formula && formula.type === 'agg') {
    simple = { func: formula.func, field: formula.field, label: metric.label };
    if (formula.kql) {
      const joiner = plan.language === 'lucene' ? ' AND ' : ' and ';
      filter = [filter, formula.kql].filter(Boolean).join(joiner);
    }
  }
  const legend = terms.length === 1 ? `{{${terms[0].field}}}` : simple.label;
  const query =
    simple.func === 'unique_count' && !terms.length && simple.field
      ? (warnOnce('去重计数写成 SQL 的 COUNT(DISTINCT)'), uniqueCountSql(index, simple.field, filter))
      : dslQuery(index, { ...plan, dslFilter: filter }, simple, terms, scalar, warnOnce, fixedInterval);
  const target = queryTarget('A', query, legend);
  return target ? [target] : [];
}

function baseOptions(unit?: string, decimals?: number, gauge?: { min: number; max: number }): JsonRecord {
  const standard: JsonRecord = {};
  if (unit) standard.unit = unit;
  if (decimals != null) standard.decimals = decimals;
  if (gauge) {
    standard.unit = standard.unit || 'percentUnit';
    standard.min = gauge.min;
    standard.max = gauge.max;
  }
  const options: JsonRecord = {
    tooltip: { mode: 'single', sort: 'none' },
    legend: { displayMode: 'list', sortBy: '', sortDir: 'asc' },
    thresholds: { steps: [{ color: '#30A46C', value: null, type: 'base' }], mode: 'absolute' },
    thresholdsStyle: { mode: 'dashed' },
  };
  if (Object.keys(standard).length) options.standardOptions = standard;
  return options;
}

function histogramInterval(column: ColumnSpec | undefined, warnings: string[]): number | undefined {
  if (!column || column.operation !== 'date_histogram') return undefined;
  const raw = column.params.interval;
  if (raw == null || raw === '' || raw === 'auto') return undefined;
  const named: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, second: 1, minute: 60, hour: 3600, day: 86400, week: 604800 };
  const text = String(raw).trim();
  if (named[text]) return named[text];
  const match = text.match(/^(\d+)\s*([smhdw])$/);
  if (match) return Number(match[1]) * named[match[2]];
  warnings.push(`时间间隔 ${text} 不能换成固定秒数，已改为自动分桶`);
  return undefined;
}

function convertLens(
  obj: JsonRecord,
  patterns: Map<string, IndexPattern>,
  warnings: string[],
  warnOnce: (message: string) => void,
  dashboardFilter: string,
  dashboardLanguage: 'kql' | 'lucene',
): FlashcatPanel | undefined {
  const attrs = asRecord(obj.attributes) ?? {};
  const state = parseEmbedded(attrs.state) ?? {};
  const visualization = asRecord(state.visualization) ?? {};
  const visType = asString(attrs.visualizationType);
  const states = asRecord(state.datasourceStates) ?? {};
  const formLayers = asRecord(asRecord(states.formBased)?.layers) ?? {};
  const layerRecords = Object.values(formLayers).filter(isRecord);
  if (!layerRecords.length) {
    warnings.push(`${asString(attrs.title)} 没有 Lens 数据层，已跳过`);
    return undefined;
  }
  const layer = layerRecords[0];
  const columns = readColumns(layer);
  const query = asRecord(state.query) ?? {};
  const language = query.language ? languageOf(asString(query.language)) : dashboardLanguage;
  let text = asString(query.query).trim();
  if (dashboardFilter && dashboardLanguage !== language) warnings.push(`${asString(attrs.title)} 的仪表盘过滤语言和面板不一致，未并入`);
  else if (dashboardFilter) text = [dashboardFilter, text].filter(Boolean).join(language === 'lucene' ? ' AND ' : ' and ');
  const plan: FilterPlan = { language, dslFilter: text };
  const index = indexOf(obj, patterns, warnings);
  const title = asString(attrs.title) || asString(obj.id);
  const layers = Array.isArray(visualization.layers) ? visualization.layers.filter(isRecord) : [];
  const firstLayer = layers[0] ?? {};
  const metricId = visualization.metricAccessor || visualization.valueAccessor || firstArrayId(firstLayer.metrics) || firstArrayId(firstLayer.accessors);
  const metricColumn = columnById(columns, metricId) ?? columns.find((column) => !['terms', 'date_histogram', 'static_value'].includes(column.operation));
  if (visType === 'lnsDatatable') {
    warnings.push(`${title} 的 Lens 表格暂未接入一键导入，已跳过`);
    return undefined;
  }
  if (!metricColumn) {
    warnings.push(`${title} 没有指标，已跳过`);
    return undefined;
  }
  const metric = metricOf(metricColumn);
  const xColumn = columnById(columns, visualization.xAccessor || firstLayer.xAccessor);
  const yColumn = columnById(columns, visualization.yAccessor || firstLayer.yAccessor);
  const seriesType = asString(firstLayer.seriesType) || asString(visualization.preferredSeriesType) || 'line';
  const timeOnX = xColumn?.operation === 'date_histogram';
  let kind = 'stat';
  let custom: JsonRecord = { calc: 'lastNotNull', textMode: 'valueAndName', colorMode: 'value', valueField: 'Value' };
  let terms: TermsSpec[] = [];
  let gauge: { min: number; max: number } | undefined;
  let legend = false;
  let showPercent = false;
  if (visType === 'lnsMetric' || visType === 'lnsLegacyMetric') kind = 'stat';
  else if (visType === 'lnsGauge') {
    kind = 'gauge';
    const minColumn = columnById(columns, visualization.minAccessor);
    const maxColumn = columnById(columns, visualization.maxAccessor);
    gauge = { min: numericParam(minColumn), max: numericParam(maxColumn, 1) };
    custom = { calc: 'lastNotNull', textMode: 'valueAndName', valueField: 'Value', style: visualization.shape === 'circle' ? 'circle' : 'arc' };
  } else if (visType === 'lnsPie') {
    kind = 'pie';
    const groups = Array.isArray(firstLayer.primaryGroups) ? firstLayer.primaryGroups : [];
    terms = groups.flatMap((id) => {
      const spec = readTerms(columnById(columns, id));
      return spec ? [spec] : [];
    });
    legend = true;
    let position = asString(firstLayer.legendPosition) || 'right';
    if (firstLayer.legendDisplay === 'hide') position = 'hidden';
    if (!['right', 'top', 'left', 'bottom', 'hidden'].includes(position)) position = 'right';
    showPercent = firstLayer.numberDisplay === 'percent';
    custom = { calc: 'lastNotNull', valueField: 'Value', donut: visualization.shape === 'donut', legengPosition: position, labelWithName: true, labelWithValue: !showPercent };
    if (showPercent) warnOnce('饼图百分比没能在浏览器里读取分类，提示和环形中心仍显示数量');
  } else if (visType === 'lnsHeatmap') {
    kind = 'heatmap';
    terms = [readTerms(xColumn), readTerms(yColumn)].flatMap((item) => (item ? [item] : []));
    custom = { calc: 'lastNotNull', xAxisField: terms[0]?.field || 'x', yAxisField: terms[1]?.field || 'y', valueField: 'Value', scheme: 'Blues' };
  } else if (visType === 'lnsXY') {
    if (timeOnX) {
      kind = 'timeseries';
      const extra = readTerms(columnById(columns, firstLayer.splitAccessor));
      terms = extra ? [extra] : [];
      const stacked = seriesType.includes('stacked');
      legend = true;
      custom = {
        drawStyle: seriesType.startsWith('bar') ? 'bars' : 'lines',
        lineInterpolation: 'linear',
        fillOpacity: seriesType.startsWith('area') ? 0.25 : 0.01,
        stack: stacked ? 'normal' : 'off',
        gradientMode: 'none',
        showPoints: 'none',
        lineWidth: 2,
      };
    } else if (seriesType.includes('horizontal')) {
      kind = 'barGauge';
      const extra = readTerms(xColumn);
      terms = extra ? [extra] : [];
      custom = { calc: 'lastNotNull', valueField: 'Value', orientation: 'horizontal', sortOrder: 'desc', displayMode: 'basic' };
    } else {
      kind = 'barchart';
      const extra = readTerms(xColumn);
      terms = extra ? [extra] : [];
      custom = { calc: 'lastNotNull', xAxisField: 'Name', yAxisField: 'Value' };
    }
  } else {
    warnings.push(`图表 ${title} (${visType}) 暂不支持，已跳过`);
    return undefined;
  }
  const options = baseOptions(metric.unit, metric.decimals, gauge);
  const legendConfig = asRecord(visualization.legend) ?? {};
  const legendRecord = asRecord(options.legend) ?? {};
  if (!legend || legendConfig.isVisible === false) legendRecord.displayMode = 'hidden';
  else {
    legendRecord.displayMode = 'list';
    legendRecord.placement = (asString(legendConfig.position) || 'right') === 'right' ? 'right' : 'bottom';
  }
  options.legend = legendRecord;
  const targets = buildTargets(index, plan, metric, terms, kind !== 'timeseries', warnOnce, warnings, histogramInterval(xColumn, warnings));
  if (!targets.length) {
    warnings.push(`${title} 没有可转换的查询，已跳过`);
    return undefined;
  }
  return { type: kind, name: title, description: asString(attrs.description), custom, options, targets, overrides: [] };
}

function convertSearch(obj: JsonRecord, patterns: Map<string, IndexPattern>, warnings: string[]): FlashcatPanel {
  const attrs = asRecord(obj.attributes) ?? {};
  const tabs = Array.isArray(attrs.tabs) ? attrs.tabs.filter(isRecord) : [];
  const tabAttrs = asRecord(tabs[0]?.attributes) ?? attrs;
  const columns = Array.isArray(tabAttrs.columns) ? tabAttrs.columns.filter((item): item is string => typeof item === 'string') : [];
  const source = parseEmbedded(asRecord(tabAttrs.kibanaSavedObjectMeta)?.searchSourceJSON) ?? {};
  const query = asRecord(source.query) ?? {};
  const index = indexOf(obj, patterns, warnings);
  const fields = [index.dateField, ...columns.filter((field) => field !== index.dateField)];
  const target: QueryTarget = {
    refId: 'A',
    kind: 'query',
    resultType: 'logs',
    query: {
      index_type: 'index',
      index: index.index,
      date_field: index.dateField,
      filter: asString(query.query).trim(),
      filter_language: languageOf(asString(query.language)),
      syntax: 'dsl',
      values: [{ func: 'rawData' }],
      limit: 100,
    },
  };
  return {
    type: 'tableNG',
    name: asString(attrs.title) || '日志',
    description: asString(attrs.description),
    custom: { showHeader: true, filterable: true, enableRowDetail: true, sortColumn: index.dateField, sortOrder: 'descend', cellOptions: { type: 'none', wrapText: true } },
    options: baseOptions(),
    targets: [target],
    overrides: [],
    transformationsNG: [{ id: 'organize', options: { fields, indexByName: Object.fromEntries(fields.map((field, indexNo) => [field, indexNo])) } }],
  };
}
