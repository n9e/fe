/**
 * 日志检索 SQL 表格模式下，数量限制留空时的后端行为与 placeholder：
 *
 * 数据源          表单配置                         后端行为                       留空提示
 * Doris           无聚合、无分组                   LIMIT 10                       默认 10 条
 * ClickHouse      无聚合、无分组                   LIMIT 10                       默认 10 条
 * Elasticsearch   无聚合、无分组                   LIMIT 100                      默认 100 条
 * Doris           无聚合、仅分组                   不追加 LIMIT                   无限制
 * ClickHouse      无聚合、仅分组                   LIMIT 1000                     默认 1000 个分组
 * Elasticsearch   无聚合、仅分组                   LIMIT 1000                     默认 1000 个分组
 * 以上三种数据源  普通表格聚合（如 COUNT、SUM），   不默认追加结果行数 LIMIT       无限制
 *                 可带分组
 *
 * 仅在 mode='table' 时使用本规则，非表格模式由调用方统一显示「无限制」。
 * 返回值仅用于生成留空提示，不应写入表单或作为默认参数提交。
 * 已有初始值及提交逻辑由调用方保留，例如 Elasticsearch 的 limit 初始值仍为 100。
 * 切换数据源、添加或移除分组和聚合时，提示应随配置更新；手填值不受影响，清空后恢复对应提示。
 */
export default function getDefaultLimit(type: string, aggregates: unknown[] = [], groupBy: string[] = []): number | undefined {
  if (aggregates.length > 0) return undefined;
  if (groupBy.length > 0) {
    return type === 'ck' || type === 'elasticsearch' ? 1000 : undefined;
  }
  if (type === 'doris' || type === 'ck') return 10;
  if (type === 'elasticsearch') return 100;
  return undefined;
}
