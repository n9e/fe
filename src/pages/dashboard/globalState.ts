import { createGlobalState } from 'react-hooks-global-state';

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
});
