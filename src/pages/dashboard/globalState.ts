import { createGlobalState } from 'react-hooks-global-state';
import { IPanel } from './types';

export const { useGlobalState } = createGlobalState<{
  dashboardMeta: {
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
}>({
  statFields: [],
  tableFields: [],
  displayedTableFields: [],
  dashboardMeta: {} as {
    dashboardId: string;
    variableConfigWithOptions: any;
    graphTooltip: string;
    graphZoom: string;
  },
  tableRefIds: [],
  panelClipboard: undefined,
});
