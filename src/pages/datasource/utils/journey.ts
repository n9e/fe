/**
 * 数据源旅途的浏览器级近似记录（产品方案 B1）：
 * 按 datasource_id 记录 验证/探索/资产创建 的首次完成时间，落 localStorage。
 * 局限：只在本浏览器有效；跨端一致的同源因果判断需要三期后端 DatasourceJourney 表替换本实现。
 */

export type DsJourneyField = 'verified_at' | 'explored_at' | 'dashboard_created_at' | 'alert_created_at';

const JOURNEY_KEY_PREFIX = 'n9e_ds_journey_';

export function markDsJourney(datasourceId: number, field: DsJourneyField): void {
  try {
    const key = `${JOURNEY_KEY_PREFIX}${datasourceId}`;
    const cur = JSON.parse(localStorage.getItem(key) || '{}');
    if (!cur[field]) {
      cur[field] = Math.floor(Date.now() / 1000);
      localStorage.setItem(key, JSON.stringify(cur));
    }
  } catch (e) {
    // localStorage 不可用时静默降级
  }
}
