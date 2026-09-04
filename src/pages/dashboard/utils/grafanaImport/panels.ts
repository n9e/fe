/*
 * Grafana 面板 → N9E IPanel 的映射（类型映射、targets、datasource、custom、row 布局）。
 * 依据 skill mapping-panels.md / mapping-targets.md 与 N9E 运行时消费。
 */
import _ from 'lodash';

import { generateQueryNameByIndex } from '@/components/QueryName/utils';

import { normalizeCalc } from './units';
import { buildSharedOptions, convertLinksGrafanaToN9E, convertOverridesGrafanaToN9E, type ReportFn } from './options';
import { resolveDatasourceRef, type ResolveContext } from './datasource';
import { DASHBOARD_VERSION, type GrafanaPanel } from './types';

// @ts-ignore plus 包：postgres SQL 表名加前缀
import addPrefixToTableNames from 'plus:/utils/convertDashboardGrafanaToN9E/addPrefixToTableNames';

/** Grafana 面板类型 → N9E 类型；不支持返回 null（丢弃 + 报告，绝不输出 unknown） */
function mapPanelType(panel: GrafanaPanel): string | null {
  switch (panel.type) {
    case 'graph':
    case 'timeseries':
    case 'barchart':
      return 'timeseries';
    case 'piechart':
      return 'pie';
    case 'gauge':
      return 'gauge';
    case 'singlestat':
      return panel.gauge?.show ? 'gauge' : 'stat';
    case 'stat':
      return 'stat';
    case 'bargauge':
      return 'barGauge';
    case 'text':
      return 'text';
    default:
      return null;
  }
}

/** 转换单个 target → N9E ITarget；不支持返回 null（已报告） */
function convertTarget(target: any, panel: GrafanaPanel, ctx: ResolveContext, report: ReportFn, path: string, index: number): any | null {
  if (!_.isPlainObject(target)) {
    report({ scope: 'target', action: 'dropped', path: `${path}.targets[${index}]`, reason: 'target 非对象，已丢弃' });
    return null;
  }
  // 后端仅接受字母序列的 refId，导入时不能沿用 Grafana 的自定义 refId。
  // generateQueryNameByIndex 会按 A-Z、AA-ZZ 的顺序生成。
  const refId = generateQueryNameByIndex(index);
  const ds = resolveDatasourceRef(target.datasource ?? panel.datasource, ctx);
  if (!ds.supported) {
    report({ scope: 'target', action: 'dropped', path: `${path}.targets[${index}]`, reason: `target ${refId} 数据源 ${ds.cate} 不支持，已丢弃` });
    return null;
  }
  const base = { refId, datasource: { cate: ds.cate, id: ds.value } };
  if (ds.cate === 'prometheus') {
    if (typeof target.expr !== 'string' || !target.expr.trim()) {
      report({ scope: 'target', action: 'dropped', path: `${path}.targets[${index}]`, reason: `target ${refId} 缺少 expr，已丢弃` });
      return null;
    }
    return {
      ...base,
      expr: target.expr,
      legend: target.legendFormat ?? '',
      instant: !!target.instant,
      hide: !!target.hide,
      kind: 'query',
      resultType: 'time_series',
    };
  }
  if (ds.cate === 'pgsql') {
    return {
      ...base,
      query: { mode: 'timeSeries', sql: addPrefixToTableNames(target.rawSql ?? '', '${dbName}', 'public') },
      kind: 'query',
      resultType: 'time_series',
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// 各面板类型 custom 转换
// ---------------------------------------------------------------------------

function convertTimeseriesCustom(panel: GrafanaPanel, report: ReportFn, path?: string): Record<string, unknown> {
  const custom = panel.fieldConfig?.defaults?.custom;
  const version = DASHBOARD_VERSION;
  if (custom) {
    const stackingMode = custom.stacking?.mode;
    if (stackingMode === 'percent') {
      report({ scope: 'option', action: 'downgraded', path, reason: 'Grafana 百分比堆叠在 N9E 未实现，降级为 off' });
    }
    return {
      version,
      drawStyle: panel.type === 'barchart' || custom.drawStyle === 'bars' ? 'bars' : 'lines',
      lineInterpolation: custom.lineInterpolation === 'smooth' ? 'smooth' : 'linear',
      fillOpacity: custom.fillOpacity ? custom.fillOpacity / 100 : 0,
      stack: stackingMode === 'normal' ? 'normal' : 'off',
      ...(custom.scaleDistribution ? { scaleDistribution: custom.scaleDistribution } : {}),
      ...(custom.spanNulls !== undefined ? { spanNulls: custom.spanNulls } : {}),
      ...(custom.lineWidth !== undefined ? { lineWidth: custom.lineWidth } : {}),
      ...(custom.gradientMode ? { gradientMode: custom.gradientMode } : {}),
      ...(custom.showPoints ? { showPoints: custom.showPoints } : {}),
      ...(custom.pointSize ? { pointSize: custom.pointSize } : {}),
    };
  }
  // legacy graph：无 fieldConfig.custom，从面板级字段映射
  return {
    version,
    drawStyle: panel.bars ? 'bars' : 'lines',
    lineInterpolation: 'linear',
    fillOpacity: panel.fill ? panel.fill / 10 : 0,
    stack: panel.stack ? 'normal' : 'off',
  };
}

function convertStatCustom(panel: GrafanaPanel): Record<string, unknown> {
  return {
    version: DASHBOARD_VERSION,
    textMode: panel.options?.textMode ?? 'value',
    colorMode: panel.options?.colorMode ?? 'value',
    calc: normalizeCalc(panel.options?.reduceOptions?.calcs?.[0]),
  };
}

function convertGaugeCustom(panel: GrafanaPanel): Record<string, unknown> {
  return {
    version: DASHBOARD_VERSION,
    textMode: panel.options?.textMode ?? 'value',
    colorMode: panel.options?.colorMode ?? 'value',
    calc: normalizeCalc(panel.options?.reduceOptions?.calcs?.[0]),
  };
}

function convertPieCustom(panel: GrafanaPanel): Record<string, unknown> {
  const legend = panel.options?.legend;
  let legengPosition = 'right';
  if (legend?.showLegend === false) {
    legengPosition = 'hidden';
  } else if (legend?.placement) {
    legengPosition = legend.placement;
  }
  return {
    version: DASHBOARD_VERSION,
    calc: normalizeCalc(panel.options?.reduceOptions?.calcs?.[0]),
    legengPosition,
    ...(panel.options?.pieType === 'donut' ? { donut: true } : {}),
  };
}

function convertBarGaugeCustom(panel: GrafanaPanel, report: ReportFn, path?: string): Record<string, unknown> {
  const displayMode = panel.options?.displayMode;
  if (displayMode === 'gradient') {
    report({ scope: 'option', action: 'downgraded', path, reason: 'barGauge gradient 展示降级为 basic' });
  }
  return {
    version: DASHBOARD_VERSION,
    calc: normalizeCalc(panel.options?.reduceOptions?.calcs?.[0]),
    ...(displayMode ? { displayMode: displayMode === 'gradient' ? 'basic' : displayMode } : {}),
  };
}

function convertTextCustom(panel: GrafanaPanel): Record<string, unknown> {
  return {
    version: DASHBOARD_VERSION,
    content: panel.options?.content ?? '',
  };
}

function convertCustomByType(panel: GrafanaPanel, n9eType: string, report: ReportFn, path?: string): Record<string, unknown> {
  switch (n9eType) {
    case 'timeseries':
      return convertTimeseriesCustom(panel, report, path);
    case 'pie':
      return convertPieCustom(panel);
    case 'stat':
      return convertStatCustom(panel);
    case 'gauge':
      return convertGaugeCustom(panel);
    case 'barGauge':
      return convertBarGaugeCustom(panel, report, path);
    case 'text':
      return convertTextCustom(panel);
    default:
      return { version: DASHBOARD_VERSION };
  }
}

/** 转换单个非 row 面板；类型不支持返回 null */
function convertNonRowPanel(panel: GrafanaPanel, ctx: ResolveContext, report: ReportFn, index: number): any | null {
  const id = panel.id !== undefined && panel.id !== null ? String(panel.id) : `panel-${index}`;
  const path = `$.panels[id=${id}]`;
  // 不支持的面板类型：保留为 unknown（渲染器会显示“无效的面板类型”占位），不粗暴丢弃
  const n9eType = mapPanelType(panel) ?? 'unknown';
  if (n9eType === 'unknown') {
    report({ scope: 'panel', action: 'downgraded', path, reason: `不支持的面板类型 ${String(panel.type)}，保留为 unknown 类型（渲染器显示无效类型占位）` });
  }

  // targets
  const targets: any[] = [];
  for (const [ti, target] of (panel.targets ?? []).entries()) {
    const converted = convertTarget(target, panel, ctx, report, path, ti);
    if (converted) targets.push(converted);
  }

  // datasource：mixed 面板 / 多 target 数据源 → target 级；否则收敛到面板级
  const isMixedPanel = panel.datasource?.uid === '-- Mixed --';
  const targetDsKeys = _.uniq(targets.map((t) => (t.datasource ? `${t.datasource.cate}:${t.datasource.id}` : '')).filter(Boolean));
  const isMixed = isMixedPanel || targetDsKeys.length > 1;
  let datasourceCate: string;
  let datasourceValue: string;
  if (isMixed) {
    datasourceCate = 'mixed';
    datasourceValue = 'mixed';
  } else {
    const ds = targets[0]?.datasource ?? resolveDatasourceRef(panel.datasource, ctx);
    datasourceCate = ds.cate;
    // target 上的数据源键为 id，resolveDatasourceRef 的键为 value，兼容两者
    datasourceValue = ds.id ?? ds.value;
    for (const t of targets) {
      delete t.datasource;
    }
  }

  const isTimeseries = n9eType === 'timeseries';
  const options = buildSharedOptions(panel, report, isTimeseries, path);
  const custom = convertCustomByType(panel, n9eType, report, path);
  const overrides = convertOverridesGrafanaToN9E(panel.fieldConfig, report, path);
  const links = convertLinksGrafanaToN9E(panel.links, report, `${path}.links`);
  if (Array.isArray(panel.transformations) && panel.transformations.length > 0) {
    report({ scope: 'custom', action: 'dropped', path, reason: 'transformations 不在映射子集内，已丢弃' });
  }
  if (targets.length === 0 && (panel.targets?.length ?? 0) > 0) {
    report({ scope: 'panel', action: 'dropped', path, reason: '所有 target 均不支持，保留空 targets' });
  }

  return {
    version: DASHBOARD_VERSION,
    id,
    type: n9eType,
    name: panel.title ?? '',
    description: panel.description ?? '',
    links,
    layout: { ...(panel.gridPos ?? {}), i: id },
    datasourceCate,
    datasourceValue,
    targets,
    options,
    custom,
    overrides,
    maxPerRow: panel.maxPerRow,
    repeat: panel.repeat,
  };
}

/**
 * 转换面板列表为扁平的 N9E panels 数组。
 * - row：N9E collapsed = !grafana collapsed；展开行子面板放顶层（row 之后），折叠行子面板缓存进 row.panels。
 */
export function convertPanelsGrafanaToN9E(panels: GrafanaPanel[] | undefined, ctx: ResolveContext, report: ReportFn): any[] {
  const out: any[] = [];
  appendPanels(panels, ctx, report, out);
  return out;
}

function appendPanels(panels: GrafanaPanel[] | undefined, ctx: ResolveContext, report: ReportFn, out: any[]) {
  for (const [index, panel] of (panels ?? []).entries()) {
    if (!_.isPlainObject(panel)) continue;

    if (panel.type === 'row') {
      const id = panel.id !== undefined && panel.id !== null ? String(panel.id) : `panel-${index}`;
      const row: any = {
        version: DASHBOARD_VERSION,
        id,
        type: 'row',
        name: panel.title ?? '',
        collapsed: !panel.collapsed,
        layout: { ...(panel.gridPos ?? {}), i: id },
      };
      out.push(row);
      if (panel.collapsed) {
        row.panels = [];
        appendPanels(panel.panels, ctx, report, row.panels);
      } else {
        appendPanels(panel.panels, ctx, report, out);
      }
      if (panel.repeat) {
        report({ scope: 'panel', action: 'dropped', path: `$.panels[id=${id}]`, reason: '按变量重复的 row 不支持，已丢弃' });
      }
      continue;
    }

    const converted = convertNonRowPanel(panel, ctx, report, index);
    if (converted) out.push(converted);
  }
}
