/*
 * Grafana 面板共享配置 → N9E options 的映射（thresholds / standardOptions / valueMappings /
 * tooltip / legend / links / overrides），依据 skill mapping-common.md。
 */
import _ from 'lodash';

import { grafanaColorNameToHex, mapUnitToN9E } from './units';
import type { UnsupportedItem } from './types';

export type ReportFn = (item: Omit<UnsupportedItem, 'path'> & { path?: string }) => void;

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** Grafana fieldConfig.defaults → N9E options.thresholds */
export function convertThresholdsGrafanaToN9E(config: any) {
  const thresholds = config?.thresholds;
  return {
    mode: thresholds?.mode ?? 'absolute',
    steps: _.map(thresholds?.steps, (step, idx: number) => ({
      ...step,
      color: grafanaColorNameToHex(step?.color),
      type: step?.value === null && idx === 0 ? 'base' : undefined,
    })),
  };
}

/** Grafana fieldConfig.defaults → N9E options.standardOptions（unit 纠正为 unit 而非 util） */
export function convertStandardOptions(config: any, report?: ReportFn, path?: string): Record<string, unknown> {
  const mapped = mapUnitToN9E(config?.unit);
  if (mapped.downgraded && config?.unit) {
    report?.({
      scope: 'option',
      action: 'downgraded',
      path,
      reason: `单位 ${config.unit} 无 N9E 对应，降级为 ${mapped.unit}`,
    });
  }
  return {
    unit: mapped.unit,
    min: config?.min ?? null,
    max: config?.max ?? null,
    decimals: config?.decimals ?? null,
    dateFormat: DEFAULT_DATE_FORMAT,
  };
}

/**
 * Grafana typed valueMappings（v30 迁移后的 fieldConfig.defaults.mappings）
 * → N9E IValueMapping[]（textValue / range / specialValue 三种形态）。
 */
export function convertValueMappingsGrafanaToN9E(mappings: unknown, report?: ReportFn, path?: string): any[] {
  if (!Array.isArray(mappings)) return [];
  const out: any[] = [];
  for (const mapping of mappings) {
    if (!_.isPlainObject(mapping)) continue;
    if (mapping.type === 'value') {
      // type:"value" 的 options 每个 key 展开为一条 textValue
      for (const [key, val] of Object.entries(mapping.options || {})) {
        const option = val as any;
        out.push({
          type: 'textValue',
          match: { textValue: String(key) },
          result: { text: option?.text ?? '', color: grafanaColorNameToHex(option?.color) },
        });
      }
    } else if (mapping.type === 'range') {
      out.push({
        type: 'range',
        match: { from: mapping.options?.from, to: mapping.options?.to },
        result: { text: mapping.options?.result?.text ?? '', color: grafanaColorNameToHex(mapping.options?.result?.color) },
      });
    } else if (mapping.type === 'special') {
      const match = mapping.options?.match;
      if (match === 'null' || match === 'empty') {
        out.push({
          type: 'specialValue',
          match: { specialValue: match },
          result: { text: mapping.options?.result?.text ?? '', color: grafanaColorNameToHex(mapping.options?.result?.color) },
        });
      } else {
        report?.({
          scope: 'option',
          action: 'dropped',
          path,
          reason: `special 匹配 ${String(match)} 无 N9E specialValue 对应，已丢弃`,
        });
      }
    } else {
      report?.({
        scope: 'option',
        action: 'dropped',
        path,
        reason: `未知的 valueMapping 类型 ${String(mapping.type)}，已丢弃`,
      });
    }
  }
  return out;
}

/** Grafana options.tooltip → N9E options.tooltip（新式直接映射，旧式 graph 用 shared/sort） */
export function convertTooltipGrafanaToN9E(panel: any): Record<string, unknown> | undefined {
  const tooltip = panel?.options?.tooltip;
  if (!tooltip || typeof tooltip !== 'object') return undefined;
  if (tooltip.mode === 'single' || tooltip.mode === 'all') {
    const sort = tooltip.sort === 'asc' || tooltip.sort === 'desc' ? tooltip.sort : 'none';
    return { mode: tooltip.mode, sort };
  }
  // legacy graph：tooltip.shared + tooltip.sort(0|1|2)
  return {
    mode: tooltip.shared ? 'all' : 'single',
    sort: tooltip.sort === 1 ? 'asc' : tooltip.sort === 2 ? 'desc' : 'none',
  };
}

/** Grafana options.legend → N9E options.legend（N9E 用 displayMode 控制显隐，无 showLegend 字段） */
export function convertLegendGrafanaToN9E(panel: any): Record<string, unknown> | undefined {
  const legend = panel?.options?.legend;
  if (!legend || typeof legend !== 'object') return undefined;
  // 新式（schema 37 后）：displayMode / showLegend
  if ('displayMode' in legend || 'showLegend' in legend) {
    let displayMode = legend.displayMode;
    if (displayMode !== 'table' && displayMode !== 'hidden') displayMode = 'list';
    if (legend.showLegend === false) displayMode = 'hidden';
    return { displayMode, placement: legend.placement === 'right' ? 'right' : 'bottom' };
  }
  // 旧式 graph legend：show / values / alignAsTable / rightSide
  let displayMode = 'list';
  if (legend.show === false) {
    displayMode = 'hidden';
  } else if (legend.alignAsTable || legend.values) {
    displayMode = 'table';
  }
  return { displayMode, placement: legend.rightSide ? 'right' : 'bottom' };
}

/**
 * Grafana links → N9E links。
 * - type:'link' 或未声明 type（面板级 DataLink 通常只有 title/url）：保留为普通链接。
 * - type:'dashboards'：Grafana 基于 tags 动态筛选，无法映射到 N9E 的具体仪表盘，整体丢弃并报告一次。
 * - 其他类型：丢弃并报告（路径带索引以区分）。
 */
export function convertLinksGrafanaToN9E(links: unknown, report?: ReportFn, path?: string): any[] {
  if (!Array.isArray(links)) return [];
  const out: any[] = [];
  let dashboardsCount = 0;
  links.forEach((item, index) => {
    const type = item?.type;
    if (type === 'link' || type === undefined || type === null) {
      out.push({ type: 'link', title: item.title, url: item.url, targetBlank: item.targetBlank });
    } else if (type === 'dashboards') {
      dashboardsCount += 1;
    } else {
      report?.({
        scope: 'custom',
        action: 'dropped',
        path: `${path}[${index}]`,
        reason: `链接类型 ${String(type)} 不支持，已丢弃`,
      });
    }
  });
  if (dashboardsCount > 0) {
    report?.({
      scope: 'custom',
      action: 'dropped',
      path,
      reason: `存在 ${dashboardsCount} 个 dashboards 类型链接（Grafana 基于 tags 筛选），无法映射到 N9E 具体仪表盘，已丢弃`,
    });
  }
  return out;
}

/**
 * Grafana fieldConfig.overrides → N9E overrides。
 * N9E 对 field overrides 的映射规则不完备，整体视为不支持：输出空 overrides，每个面板报告一条。
 */
export function convertOverridesGrafanaToN9E(fieldConfig: any, report?: ReportFn, path?: string): any[] {
  const overrides = fieldConfig?.overrides;
  if (!Array.isArray(overrides) || overrides.length === 0) return [];
  report?.({
    scope: 'custom',
    action: 'dropped',
    path,
    reason: '面板 fieldConfig.overrides 不在 N9E 映射子集内，已整体丢弃',
  });
  return [];
}

/**
 * 组装面板共享 options：standardOptions / valueMappings / thresholds / thresholdsStyle / tooltip / legend。
 * defaultThresholdsStyle：timeseries 系面板（graph/timeseries/barchart）默认 line。
 */
export function buildSharedOptions(panel: any, report?: ReportFn, defaultThresholdsStyle = false, path?: string): Record<string, unknown> {
  const config = panel?.fieldConfig?.defaults;
  const shared: Record<string, unknown> = {};

  if (config) {
    shared.standardOptions = convertStandardOptions(config, report, path);
    if (Array.isArray(config.mappings) && config.mappings.length > 0) {
      shared.valueMappings = convertValueMappingsGrafanaToN9E(config.mappings, report, path);
    }
    if (Array.isArray(config.thresholds?.steps) && config.thresholds.steps.length > 0) {
      shared.thresholds = convertThresholdsGrafanaToN9E(config);
    }
  }
  // thresholdsStyle：折线图系列面板由 grafana custom.thresholdsStyle.mode 决定，缺省 line
  if (defaultThresholdsStyle) {
    shared.thresholdsStyle = { mode: config?.custom?.thresholdsStyle?.mode || 'line' };
  }

  const tooltip = convertTooltipGrafanaToN9E(panel);
  if (tooltip) shared.tooltip = tooltip;
  const legend = convertLegendGrafanaToN9E(panel);
  if (legend) shared.legend = legend;

  return shared;
}
