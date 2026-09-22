/**
 * 仪表盘持久化配置版本。
 *
 * 这是 `dashboard.version` 的唯一来源：新建、导入（含 Grafana 导入）和迁移都必须使用它。
 * 放在无依赖的纯模块中，避免导入 `config.tsx`（依赖 `@/utils/constant` 的 import.meta）
 * 导致 node 环境测试无法加载。
 */
export const DASHBOARD_VERSION = '4.1.0';
