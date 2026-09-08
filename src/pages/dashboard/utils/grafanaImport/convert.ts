/*
 * Grafana dashboard → N9E dashboard 转换公共入口。
 *
 * convertDashboardGrafanaToN9E            —— 返回 N9E dashboard JSON（兼容既有调用方）
 * convertDashboardGrafanaToN9EWithReport  —— 返回 { dashboard, report }（导入页两步式展示用）
 */
import _ from 'lodash';

import { migrateDashboardSchema, DASHBOARD_SCHEMA_VERSION } from './migrate';
import { convertVariablesGrafanaToN9E, type GroupedDatasourceList } from './variables';
import { convertPanelsGrafanaToN9E } from './panels';
import { convertLinksGrafanaToN9E, type ReportFn } from './options';
import { DASHBOARD_VERSION, type ConvertResult, type UnsupportedItem } from './types';

/** 转换选项：datasourceList 用于给数据源变量补充默认值 */
export interface ConvertOptions {
  datasourceList?: GroupedDatasourceList;
}

/** 校验输入是否是可转换的 classic dashboard */
function validateDashboard(source: unknown): asserts source is Record<string, any> {
  if (typeof source !== 'object' || source === null) {
    throw new Error('非法的 Grafana dashboard JSON，请输入 classic dashboard 配置');
  }
  const obj = source as Record<string, any>;
  if ('elements' in obj || 'layout' in obj) {
    throw new Error('暂不支持 Grafana v2 的 elements/layout 结构，仅支持 classic panels 结构');
  }
  if (!Array.isArray(obj.panels)) {
    throw new Error('缺少 panels 数组，不是可导入的 classic Grafana dashboard');
  }
}

/** 转换并返回报告（含迁移台账与不支持项） */
export function convertDashboardGrafanaToN9EWithReport(source: unknown, options?: ConvertOptions): ConvertResult {
  validateDashboard(source);
  // grafana 导出常为 { dashboard: {...} } 包裹，解包后处理
  const root: Record<string, any> = 'dashboard' in (source as any) && _.isPlainObject((source as any).dashboard) ? (source as any).dashboard : (source as Record<string, any>);

  const unsupportedItems: UnsupportedItem[] = [];
  const report: ReportFn = (item) => {
    unsupportedItems.push({
      scope: item.scope,
      path: item.path ?? '',
      action: item.action,
      reason: item.reason,
    });
  };

  // 1. schema 迁移（到 42）
  const { dashboard, migrations } = migrateDashboardSchema(root);
  const inputSchemaVersion = typeof root?.schemaVersion === 'number' ? root.schemaVersion : 0;

  // 2. 映射
  const { vars, context } = convertVariablesGrafanaToN9E(dashboard, report, { datasourceList: options?.datasourceList });
  const links = convertLinksGrafanaToN9E(dashboard.links, report, '$.links');
  const panels = convertPanelsGrafanaToN9E(dashboard.panels, context, report);

  // 3. 组装输出（真 4.0.0 结构）
  const tags = Array.isArray(dashboard.tags) ? dashboard.tags.filter((t): t is string => typeof t === 'string').join(' ') : '';
  const output = {
    name: dashboard.title ?? '',
    tags,
    configs: {
      version: DASHBOARD_VERSION,
      links,
      var: vars,
      panels,
      graphTooltip: 'default' as const,
      graphZoom: 'default' as const,
    },
  };

  // 4. 统计摘要
  // 仅统计真正被丢弃的项（action==='dropped'），downgraded/defaulted 的项仍保留在输出中，
  // 不重复计入 dropped，避免与 convertedPanels 双重计数。
  const countDropped = (scope: UnsupportedItem['scope']) => unsupportedItems.filter((i) => i.scope === scope && i.action === 'dropped').length;
  const convertedPanels = panels.filter((p) => p.type !== 'row').length;
  const droppedPanels = countDropped('panel');
  const summary = {
    panels: convertedPanels + droppedPanels,
    convertedPanels,
    droppedPanels,
    targets: panels.reduce((sum, p) => sum + (Array.isArray(p.targets) ? p.targets.length : 0), 0),
    droppedTargets: countDropped('target'),
    variables: vars.length,
    droppedVariables: countDropped('variable'),
  };

  return {
    dashboard: output,
    report: {
      migration: {
        inputSchemaVersion,
        targetSchemaVersion: DASHBOARD_SCHEMA_VERSION,
        migrations,
      },
      unsupportedItems,
      summary,
    },
  };
}

/** 转换 Grafana dashboard → N9E dashboard JSON（不含报告，兼容既有调用方） */
export function convertDashboardGrafanaToN9E(data: unknown, options?: ConvertOptions): any {
  return convertDashboardGrafanaToN9EWithReport(data, options).dashboard;
}

/**
 * 检测 Grafana dashboard 版本。
 * 迁移已覆盖 <42 的全部 classic 版本，统一放行（保留导出兼容既有调用方）。
 */
export function checkGrafanaDashboardVersion(_data: unknown): number {
  return 2;
}
