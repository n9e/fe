import { createDashboardRuntimeStore } from '@/pages/dashboard/globalState';

/** 测试中显式传给 DashboardRuntimeProvider 的固定实例，避免状态泄漏到生产运行时。 */
export const dashboardTestRuntimeStore = createDashboardRuntimeStore();

/** 在每个测试前还原测试实例的全部可变运行时字段。 */
export function resetDashboardTestRuntime() {
  dashboardTestRuntimeStore.setGlobalState('variablesWithOptions', []);
  dashboardTestRuntimeStore.setGlobalState('variableExecution', { sessionId: 0, isExecuting: false, revision: 0 });
  dashboardTestRuntimeStore.setGlobalState('range', { start: 'now-1h', end: 'now' });
  dashboardTestRuntimeStore.setGlobalState('statFields', []);
  dashboardTestRuntimeStore.setGlobalState('tableFields', []);
  dashboardTestRuntimeStore.setGlobalState('displayedTableFields', []);
  dashboardTestRuntimeStore.setGlobalState('tableRefIds', []);
  dashboardTestRuntimeStore.setGlobalState('series', undefined);
}
