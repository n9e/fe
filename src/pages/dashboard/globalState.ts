import React, { createContext, useContext, useRef } from 'react';
import { createGlobalState } from 'react-hooks-global-state';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IVariable } from './Variables/types';
import type { DashboardSeries } from './Renderer/datasource/types';

export interface DashboardMeta {
  id: number;
  group_id: number;
  dashboardId: string;
  variableConfigWithOptions: IVariable[];
  graphTooltip: string;
  graphZoom: string;
  public: 0 | 1;
  public_cate: 0 | 1 | 2; // 0: 匿名访问，1: 需要登录, 2: 授权访问
}

export interface VariableExecutionState {
  sessionId: number;
  isExecuting: boolean;
  revision: number;
}

export interface DashboardRuntimeState {
  dashboardMeta: DashboardMeta;
  variablesWithOptions: IVariable[];
  variableExecution: VariableExecutionState;
  range: IRawTimeRange;
  statFields: string[];
  tableFields: string[];
  displayedTableFields: string[];
  tableRefIds: string[];
  series?: DashboardSeries[];
}

/** 创建一个仪表盘实例独享的运行时状态，避免并行页面互相覆盖变量和查询辅助信息。 */
export function createDashboardRuntimeStore() {
  return createGlobalState<DashboardRuntimeState>({
    dashboardMeta: {} as DashboardMeta,
    variablesWithOptions: [],
    variableExecution: {
      sessionId: 0,
      isExecuting: false,
      revision: 0,
    },
    range: {
      start: 'now-1h',
      end: 'now',
    },
    statFields: [],
    tableFields: [],
    displayedTableFields: [],
    tableRefIds: [],
    series: undefined,
  });
}

export type DashboardRuntimeStore = ReturnType<typeof createDashboardRuntimeStore>;

const DashboardRuntimeContext = createContext<DashboardRuntimeStore | null>(null);

/**
 * 为一个仪表盘 React 树提供独立运行时状态。
 *
 * `store` 仅供测试传入可观测的固定实例；生产调用始终创建随组件卸载的实例。
 */
export function DashboardRuntimeProvider({ children, store }: { children: React.ReactNode; store?: DashboardRuntimeStore }) {
  const createdStoreRef = useRef<DashboardRuntimeStore>();
  if (!createdStoreRef.current) {
    createdStoreRef.current = store ?? createDashboardRuntimeStore();
  }
  return React.createElement(DashboardRuntimeContext.Provider, { value: createdStoreRef.current }, children);
}

/** 读取当前仪表盘实例的指定运行时状态；调用方必须位于 DashboardRuntimeProvider 内。 */
export function useGlobalState<Key extends keyof DashboardRuntimeState>(key: Key) {
  const store = useContext(DashboardRuntimeContext);
  if (!store) {
    throw new Error('Dashboard runtime state requires DashboardRuntimeProvider');
  }
  return store.useGlobalState(key);
}

/** 取得当前实例 store，供独立 React root 显式续接所属仪表盘上下文。 */
export function useDashboardRuntimeStore(): DashboardRuntimeStore {
  const store = useContext(DashboardRuntimeContext);
  if (!store) {
    throw new Error('Dashboard runtime state requires DashboardRuntimeProvider');
  }
  return store;
}

/**
 * 读取可选的仪表盘运行时，用于 legacy 图表等可在仪表盘外复用的边界组件。
 *
 * 调用方必须在缺失时显式创建独立 Provider，不能回退到模块级共享状态。
 */
export function useDashboardRuntimeStoreIfAvailable(): DashboardRuntimeStore | null {
  return useContext(DashboardRuntimeContext);
}
