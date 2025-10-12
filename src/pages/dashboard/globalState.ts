import { createGlobalState } from 'react-hooks-global-state';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IPanel } from './types';
import { IVariable } from './Variables/types';

interface DashboardMeta {
  id: number;
  group_id: number;
  dashboardId: string;
  variableConfigWithOptions: any;
  graphTooltip: string;
  graphZoom: string;
  public: 0 | 1;
  public_cate: 0 | 1 | 2; // 0: 匿名访问，1: 需要登录, 2: 授权访问
}

export const { useGlobalState, getGlobalState } = createGlobalState<{
  dashboardMeta: DashboardMeta; // 仪表盘的一些配置信息
  variablesWithOptions: IVariable[]; // 变量数据
  range: IRawTimeRange; // 仪表盘的时间范围

  statFields: string[];
  tableFields: string[];
  displayedTableFields: string[];
  tableRefIds: string[]; // labelValuesToRows 模式下，tableRefIds 用于记录当前表格的 refId
  panelClipboard?: IPanel;
  series?: any[];
}>({
  dashboardMeta: {} as DashboardMeta,
  variablesWithOptions: [],
  range: {
    start: 'now-1h',
    end: 'now',
  },

  statFields: [],
  tableFields: [],
  displayedTableFields: [],
  tableRefIds: [],
  panelClipboard: undefined,
  series: undefined,
});
