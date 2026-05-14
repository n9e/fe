/**
 * tooltipPlugin 中的核心过滤逻辑
 *
 * 过滤条件：
 *   1. seriesItem.show !== false
 *   2. value != null（同时排除 null 和 undefined）
 *   3. 当 n9e_internal.values 存在时，以原始值为准（堆叠图场景）
 */
export function shouldShowSeriesInTooltip(
  seriesItem: { show?: boolean; n9e_internal?: { values?: (number | null | undefined)[] } },
  values: (number | null | undefined)[],
  idx: number,
): boolean {
  const value = seriesItem.n9e_internal?.values ? seriesItem.n9e_internal.values[idx] : values[idx];
  return seriesItem.show !== false && value != null;
}
