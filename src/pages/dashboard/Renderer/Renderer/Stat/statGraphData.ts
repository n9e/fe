import type uPlot from 'uplot';

/**
 * Stat sparkline 的输入点：第一个元素是时间戳，第二个元素可能是数值、字符串或空值。
 * 查询结果里空值可能是 null、undefined、'' 或 NaN。
 */
export type StatSparklinePoint = [timestamp: number, value: number | string | null | undefined];

/**
 * 把空值统一为 null，让 uPlot 在缺失处断开折线而不是画成 0。
 *
 * @returns 合法数值返回数字，其余（null / undefined / 空串 / NaN / 非数字字符串）返回 null
 */
function toNumericValue(value: StatSparklinePoint[1]): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

/**
 * 将面板序列转换为 uPlot 需要的有序数据。
 *
 * - 丢弃时间戳非法的点（无法定位到 x 轴）；
 * - 按时间戳排序，保证 uPlot 的 x 严格递增；
 * - 同一时间戳保留最后一个值（后到的结果覆盖先到的）；
 * - 空值保留为 null，配合 `spanGaps: false` 呈现断线。
 */
export function buildStatSparklineData(data?: StatSparklinePoint[]): uPlot.AlignedData {
  const valueByTimestamp = new Map<number, number | null>();
  (data ?? []).forEach((point) => {
    const timestamp = Number(point?.[0]);
    if (!Number.isFinite(timestamp)) return;
    valueByTimestamp.set(timestamp, toNumericValue(point?.[1]));
  });

  const timestamps = [...valueByTimestamp.keys()].sort((a, b) => a - b);
  return [timestamps, timestamps.map((timestamp) => valueByTimestamp.get(timestamp) ?? null)];
}

/** 判断 sparkline 是否含有可绘制的数值点；全为空值时无需创建图表。 */
export function hasDrawableSparklineValue(data?: StatSparklinePoint[]): boolean {
  return (data ?? []).some((point) => toNumericValue(point?.[1]) !== null);
}
