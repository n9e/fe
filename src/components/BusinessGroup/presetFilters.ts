/**
 * 各页面的业务组预置筛选并不完全一致：
 * - 仪表盘使用 -1 表示公开仪表盘；
 * - 机器列表使用 0 表示未分组机器；
 * - -2（全部）为两者共同支持的筛选值。
 *
 * 页面切换时保留普通业务组和共同预置值，遇到另一页面专属值则回退为“全部”。
 */
export function getDashboardCompatibleGids(gids?: string) {
  return gids === '0' ? '-2' : gids;
}

export function getTargetsCompatibleGids(gids?: string) {
  return gids === '-1' ? '-2' : gids;
}
