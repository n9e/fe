const HOUR_IN_MS = 3600 * 1000;

/**
 * 把已解析的时间范围压成"小时桶"，用作字段列的重取依据。
 *
 * 只收解析后的时间戳，不收 range 本身：相对范围（如"最近 1 小时"）的字面值是
 * { start: 'now-1h', end: 'now' }，永远不变，拿它做重取依据的话，跨天滚到新分区之后
 * 字段列不会更新。签名只接受毫秒时间戳，就不存在传错的可能。
 *
 * 分桶粒度与后端 /doris-index 的缓存键一致：同一小时内重取也拿不到不同结果，跨小时才值得重取。
 */
export function getRangeHourBucket(from?: number, to?: number): string {
  if (!from || !to) return '';
  return `${Math.floor(from / HOUR_IN_MS)}-${Math.floor(to / HOUR_IN_MS)}`;
}
