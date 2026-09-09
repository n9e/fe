import _ from 'lodash';

import { VERIFIED_DATASOURCE_IDS_KEY } from '../../../constants';

/**
 * 「上次真的查到了指标」的数据源。
 *
 * 抽成独立模块是为了让两条采集流程共用同一份记忆：开源向导（本目录）在验证通过时写，
 * 专业版采集配置页的到达验证读 —— 用户在哪条路上验证成功过，另一条路就不必再猜一次
 * 「机器指标落在哪个数据源」。
 */
export function readVerifiedDatasourceIds(): number[] {
  try {
    const raw = localStorage.getItem(VERIFIED_DATASOURCE_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? _.filter(parsed, (id) => typeof id === 'number') : [];
  } catch (e) {
    return [];
  }
}

export function writeVerifiedDatasourceIds(ids: number[]) {
  try {
    localStorage.setItem(VERIFIED_DATASOURCE_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    // 记不住只是下次要重新选，不值得打断验证流程
  }
}
