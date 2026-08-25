/*
 * Grafana 模板变量 → N9E configs.var 的映射（依据 skill mapping-variables.md）。
 */
import _ from 'lodash';

import type { GrafanaDashboard } from './types';
import { normalizeMacros } from './units';
import { collectPanelCates, normalizeCate, resolveDatasourceRef, type DatasourceVarRef, type ResolveContext } from './datasource';
import type { ReportFn } from './options';

// @ts-ignore plus 包：postgres SQL 表名加前缀
import addPrefixToTableNames from 'plus:/utils/convertDashboardGrafanaToN9E/addPrefixToTableNames';

/** N9E 变量持久化结构（宽松，type/hide 等为运行时字段） */
export interface N9eVariable {
  type: 'query' | 'custom' | 'constant' | 'datasource' | 'textbox';
  name: string;
  label?: string;
  definition?: string;
  defaultValue?: string | number;
  allValue?: string | null;
  allOption?: boolean;
  multi?: boolean;
  reg?: string;
  hide?: boolean;
  datasource?: { cate: string; value: string };
  [key: string]: any;
}

/** 按 cate 分组的数据源列表（来自 CommonStateContext.groupedDatasourceList） */
export type GroupedDatasourceList = Record<string, { id: number; is_default?: boolean }[]>;

/** 取某 cate 的默认数据源 id（优先 is_default，否则第一个） */
function defaultDatasourceId(cate: string, list?: GroupedDatasourceList): number | undefined {
  const items = list?.[cate];
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items.find((d) => d.is_default)?.id ?? items[0]?.id;
}

/**
 * N9E 的 All 选项要求多选。Grafana 允许 includeAll + 非多选（All 作为单选普通项），
 * 盲目标 multi=true 会改变变量单选/多选语义，因此降级为：移除 All 选项、保持单选。
 */
function adaptAllOption(v: any, allOption: boolean, multi: boolean, report: ReportFn, path?: string): { allOption: boolean; multi: boolean } {
  if (allOption && !multi) {
    report({
      scope: 'variable',
      action: 'downgraded',
      path,
      reason: `变量 ${String(v?.name)}：N9E 的 All 选项要求多选，已移除 All 选项（保持单选）`,
    });
    return { allOption: false, multi: false };
  }
  return { allOption, multi };
}

function toHide(hide: unknown): boolean {
  // grafana: 0=不隐藏、1=隐藏 label（仍显示控件）、2=隐藏整个变量；未定义等同 0。
  // N9E hide 为布尔，仅 hide=2（或 true）时视为隐藏，避免未定义 hide 的变量被误隐藏
  if (hide === true) return true;
  if (typeof hide === 'number') return hide === 2;
  return false;
}

/** 转换单个 templating 变量；不支持类型返回 null（已报告） */
function convertTemplatingVariable(v: any, ctx: ResolveContext, report: ReportFn, path?: string): N9eVariable | null {
  if (!_.isPlainObject(v)) return null;
  const hide = toHide(v.hide);
  const { allOption, multi } = adaptAllOption(v, !!v.includeAll, !!v.multi, report, path);

  switch (v.type) {
    case 'query': {
      const resolved = resolveDatasourceRef(v.datasource, ctx);
      if (!resolved.supported) {
        report({ scope: 'variable', action: 'dropped', path, reason: `query 变量 ${String(v.name)} 的数据源 ${resolved.cate} 不支持，已丢弃` });
        return null;
      }
      let definition = typeof v.query === 'string' ? v.query : typeof v.query?.query === 'string' ? v.query.query : typeof v.definition === 'string' ? v.definition : '';
      definition = normalizeMacros(definition);
      const out: N9eVariable = {
        type: 'query',
        name: v.name,
        label: v.label,
        allValue: v.allValue ?? null,
        allOption,
        multi,
        reg: v.regex ?? '',
        hide,
        definition,
        datasource: { cate: resolved.cate, value: resolved.value },
      };
      if (resolved.cate === 'pgsql') {
        out.definition = addPrefixToTableNames(out.definition ?? '', '${dbName}', 'public');
        out.datasource = { cate: 'pgsql', value: resolved.value };
      }
      return out;
    }
    case 'custom': {
      return {
        type: 'custom',
        name: v.name,
        definition: normalizeMacros(v.query ?? ''),
        allValue: v.allValue ?? null,
        allOption,
        multi,
        hide,
      };
    }
    case 'constant': {
      return { type: 'constant', name: v.name, definition: v.query ?? '', hide };
    }
    case 'textbox': {
      return { type: 'textbox', name: v.name, defaultValue: v.query ?? '', hide };
    }
    case 'interval': {
      const definition = normalizeMacros(v.query ?? '');
      if (!definition) {
        report({ scope: 'variable', action: 'defaulted', path, reason: `interval 变量 ${String(v.name)} 无定义，使用默认间隔列表` });
        return {
          type: 'custom',
          name: v.name,
          definition: '1s,5s,1m,5m,1h,6h,1d',
          allValue: v.allValue ?? null,
          allOption,
          multi,
          hide,
        };
      }
      return { type: 'custom', name: v.name, definition, allValue: v.allValue ?? null, allOption, multi, hide };
    }
    default:
      report({ scope: 'variable', action: 'dropped', path, reason: `不支持的变量类型 ${String(v.type)}，已丢弃` });
      return null;
  }
}

/**
 * 转换 dashboard 的变量为 N9E configs.var。
 * 数据源变量来源：__inputs（最前）→ templating datasource 变量 → 按面板使用 cate 兜底。
 * 同时返回面板转换所需的解析上下文（数据源变量引用 + __inputs 兜底名）。
 * datasourceList：按 cate 分组的数据源列表，用于给数据源变量补充默认值。
 */
export function convertVariablesGrafanaToN9E(
  dashboard: GrafanaDashboard,
  report: ReportFn,
  options?: { datasourceList?: GroupedDatasourceList },
): { vars: N9eVariable[]; context: ResolveContext } {
  const { datasourceList } = options || {};
  const templatingList = dashboard.templating?.list;
  const templating = Array.isArray(templatingList) ? templatingList : [];
  const inputs = Array.isArray(dashboard.__inputs) ? dashboard.__inputs : [];

  const datasourceVars: DatasourceVarRef[] = [];
  const vars: N9eVariable[] = [];
  // 按名称去重：Grafana 导出常在 __inputs 与 templating 同时声明同名数据源变量
  const hasVar = (name: string) => vars.some((v) => v.name === name);

  // 1. __inputs datasource 变量（最前）
  for (const item of inputs) {
    if (item?.type !== 'datasource' || typeof item.name !== 'string') continue;
    if (hasVar(item.name)) continue;
    const cate = normalizeCate(item.pluginId);
    vars.push({ type: 'datasource', name: item.name, definition: cate, hide: false, defaultValue: defaultDatasourceId(cate, datasourceList) });
    if (cate !== 'unknown' && !datasourceVars.some((v) => v.name === item.name)) {
      datasourceVars.push({ name: item.name, cate });
    }
  }

  // 2. templating 的 datasource 变量
  for (const v of templating) {
    if (v?.type !== 'datasource') continue;
    if (hasVar(v.name)) continue;
    const cate = normalizeCate(v.query);
    vars.push({ type: 'datasource', name: v.name, definition: cate, hide: toHide(v.hide), defaultValue: defaultDatasourceId(cate, datasourceList) });
    if (cate !== 'unknown' && !datasourceVars.some((x) => x.name === v.name)) {
      datasourceVars.push({ name: v.name, cate });
    }
  }

  // 3. 按面板实际使用 cate 兜底数据源变量（prometheus 优先占位 'datasource'，其余 datasource_<cate>）
  const usedCates = collectPanelCates(dashboard.panels).sort((a, b) => (a === 'prometheus' ? -1 : 1) - (b === 'prometheus' ? -1 : 1));
  let primaryAssigned = datasourceVars.length > 0;
  for (const cate of usedCates) {
    if (datasourceVars.some((v) => v.cate === cate)) continue;
    let name = primaryAssigned ? `datasource_${cate}` : 'datasource';
    primaryAssigned = true;
    // 避免与已有变量（任意类型）重名
    let suffix = 1;
    while (hasVar(name)) {
      name = `datasource_${cate}_${suffix}`;
      suffix += 1;
    }
    vars.push({ type: 'datasource', name, definition: cate, hide: false, defaultValue: defaultDatasourceId(cate, datasourceList) });
    datasourceVars.push({ name, cate });
  }

  // 4. postgres 使用时的 dbName 隐藏常量（置顶）
  if (usedCates.includes('pgsql') && !vars.some((v) => v.name === 'dbName')) {
    vars.unshift({ type: 'constant', name: 'dbName', label: '数据库名', hide: true, definition: 'dbName' });
  }

  // 5. 其余变量
  const inputsFallbackName = inputs.find((i) => i?.type === 'datasource')?.name;
  const ctx: ResolveContext = { datasourceVars, inputsFallbackName };
  for (const v of templating) {
    if (v?.type === 'datasource') continue;
    const converted = convertTemplatingVariable(v, ctx, report, `$.templating.list[name=${String(v?.name)}]`);
    if (converted) vars.push(converted);
  }

  return { vars, context: ctx };
}
