/*
 * Grafana 导入相关的内部类型定义。
 *
 * Grafana classic dashboard JSON 结构松散，这里用带索引签名的宽松接口描述，
 * 供迁移与映射模块使用；N9E 侧输出仍以 @/pages/dashboard/types 的正式类型为准。
 */

/** N9E dashboard 版本（与 @/pages/dashboard/config 的 DASHBOARD_VERSION 保持一致） */
export const DASHBOARD_VERSION = '4.0.0';

/** Grafana 查询 target（宽松） */
export interface GrafanaTarget {
  refId?: string;
  expr?: string;
  legendFormat?: string;
  datasource?: unknown;
  [key: string]: any;
}

/** Grafana 面板（宽松） */
export interface GrafanaPanel {
  id?: number;
  type?: string;
  title?: string;
  collapsed?: boolean;
  panels?: GrafanaPanel[];
  gridPos?: {
    h?: number;
    w?: number;
    x?: number;
    y?: number;
  };
  targets?: GrafanaTarget[];
  fieldConfig?: any;
  options?: any;
  [key: string]: any;
}

/** Grafana classic dashboard（宽松） */
export interface GrafanaDashboard {
  schemaVersion?: number;
  title?: string;
  panels?: GrafanaPanel[];
  templating?: {
    list?: any[];
  };
  timepicker?: any;
  [key: string]: any;
}

/** 迁移台账条目状态 */
export type MigrationStatus = 'applied' | 'not-applicable' | 'skipped';

/** 迁移台账单条记录 */
export interface MigrationLedgerEntry {
  version: number;
  status: MigrationStatus;
  reason: string;
}

/** 不支持项报告条目（对齐 skill 的 unsupported-report-format） */
export interface UnsupportedItem {
  scope: 'dashboard' | 'variable' | 'panel' | 'target' | 'option' | 'custom';
  path: string;
  action: 'dropped' | 'downgraded' | 'defaulted';
  reason: string;
}

/** 转换报告：迁移台账 + 不支持项 + 统计摘要 */
export interface ConversionReport {
  migration: {
    inputSchemaVersion: number;
    targetSchemaVersion: number;
    migrations: MigrationLedgerEntry[];
  };
  unsupportedItems: UnsupportedItem[];
  summary?: {
    panels: number;
    convertedPanels: number;
    droppedPanels: number;
    targets: number;
    droppedTargets: number;
    variables: number;
    droppedVariables: number;
  };
}

/** 迁移结果 */
export interface MigrateResult {
  dashboard: GrafanaDashboard;
  migrations: MigrationLedgerEntry[];
}

/** 转换结果：N9E dashboard + 报告 */
export interface ConvertResult {
  dashboard: {
    name: string;
    tags: string;
    configs: any;
  };
  report: ConversionReport;
}
