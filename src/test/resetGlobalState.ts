import { setGlobalState } from '@/pages/dashboard/globalState';

/**
 * 重置仪表盘全局状态单例（react-hooks-global-state 是模块级单例，
 * 测试之间需清理，避免上一个用例的写入泄漏到下一个用例）。
 */
export function resetDashboardGlobalState() {
  setGlobalState('variablesWithOptions', []);
  setGlobalState('range', { start: 'now-1h', end: 'now' });
  setGlobalState('statFields', []);
  setGlobalState('tableFields', []);
  setGlobalState('displayedTableFields', []);
  setGlobalState('tableRefIds', []);
  setGlobalState('series', undefined);
}
