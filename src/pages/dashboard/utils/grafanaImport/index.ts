/*
 * Grafana dashboard 导入转换模块（迁移 + 映射 + 报告）。
 */
export {
  migrateDashboardSchema,
  DASHBOARD_SCHEMA_VERSION,
  GRID_CELL_HEIGHT,
  GRID_CELL_VMARGIN,
  GRID_COLUMN_COUNT,
  DEFAULT_PANEL_SPAN,
  DEFAULT_ROW_HEIGHT,
  MIN_PANEL_HEIGHT,
} from './migrate';
export { convertDashboardGrafanaToN9E, convertDashboardGrafanaToN9EWithReport, checkGrafanaDashboardVersion } from './convert';
export type { MigrationLedgerEntry, UnsupportedItem, ConversionReport, ConvertResult, MigrateResult, GrafanaDashboard, GrafanaPanel } from './types';
