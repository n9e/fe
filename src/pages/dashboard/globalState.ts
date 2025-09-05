import { createGlobalState } from 'react-hooks-global-state';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IPanel } from './types';

export const { useGlobalState } = createGlobalState<{
  dashboardMeta: {
    group_id: number;
    dashboardId: string;
    variableConfigWithOptions: any;
    graphTooltip: string;
    graphZoom: string;
  };
  statFields: string[];
  tableFields: string[];
  displayedTableFields: string[];
  tableRefIds: string[]; // labelValuesToRows 模式下，tableRefIds 用于记录当前表格的 refId
  panelClipboard?: IPanel;
  series?: any[];
  range: IRawTimeRange;
}>({
  statFields: [],
  tableFields: [],
  displayedTableFields: [],
  dashboardMeta: {} as {
    group_id: number;
    dashboardId: string;
    variableConfigWithOptions: any;
    graphTooltip: string;
    graphZoom: string;
  },
  tableRefIds: [],
  panelClipboard: undefined,
  series: undefined,
  range: {
    start: 'now-1h',
    end: 'now',
  },
});
