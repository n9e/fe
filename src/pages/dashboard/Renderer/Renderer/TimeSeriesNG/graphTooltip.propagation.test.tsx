/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import Main from './Main';
import type { RenderResult } from '@testing-library/react';
import { DashboardRuntimeProvider } from '../../../globalState';
import type { DashboardMeta } from '../../../globalState';
import { dashboardTestRuntimeStore } from '@/test/dashboardRuntime';

const { getGlobalState, setGlobalState } = dashboardTestRuntimeStore;

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/utils/constant', () => ({
  IS_PLUS: false,
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
  FONT_FAMILY: '',
  THEME: { light: {}, dark: {} },
}));
// 裁剪与断言无关的重型子树，避免 node_modules 的 ESM 无法被 ts-jest 处理
jest.mock('@/components/TimeRangePicker', () => ({
  parseRange: () => ({ start: 0, end: 0 }),
  timeRangeUnix: () => ({}),
}));
jest.mock('../../registry/defaults', () => ({ defaultOptionsValues: { thresholds: { mode: 'absolute' } }, calcsOptions: [] }));
jest.mock('./components/ResetZoomButton', () => () => null);
jest.mock('./components/Annotation/AddButton', () => () => null);
jest.mock('./components/Annotation/annotationsPlugin', () => ({
  __esModule: true,
  default: () => ({ hooks: {} }),
  Markers: () => null,
}));

const tooltipCalls: Array<{ graphTooltip?: string; id?: string }> = [];
const axisBuilderCalls: Array<{ theme?: string }> = [];
const renderedCharts: string[] = [];

jest.mock('@/components/UPlotChart', () => {
  const actual = jest.requireActual('@/components/UPlotChart');
  return {
    ...actual,
    __esModule: true,
    tooltipPlugin: (options: { graphTooltip?: string; id?: string }) => {
      tooltipCalls.push(options);
      return actual.tooltipPlugin(options);
    },
    axisBuilder: (options: { theme?: string }) => {
      axisBuilderCalls.push(options);
      return actual.axisBuilder(options);
    },
    default: ({ id }: { id: string }) => {
      renderedCharts.push(id);
      return <div data-testid={`uplot-${id}`} />;
    },
  };
});

const baseMeta = {
  id: 1,
  group_id: 1,
  dashboardId: '1',
  graphZoom: 'default',
} as DashboardMeta;

/**
 * props 必须在多次渲染间保持稳定：baseSeries 等直接位于重建图表的 useMemo 依赖数组中，
 * 每次渲染新建数组会让该 memo 无条件重算，测试就无法守住 darkMode 这一项依赖。
 */
const panelProps = {
  id: 'test-panel',
  frames: [[1000, 2000]] as never,
  baseSeries: [] as never,
  width: 400,
  height: 200,
  panel: { type: 'timeseries', custom: {}, options: {}, targets: [] } as never,
  series: [] as never,
  annotations: [] as never,
};

function renderMain(darkMode = false) {
  return render(
    <DashboardRuntimeProvider store={dashboardTestRuntimeStore}>
      <MemoryRouter>
        <Main {...panelProps} darkMode={darkMode} />
      </MemoryRouter>
    </DashboardRuntimeProvider>,
  );
}

function rerenderMain(utils: RenderResult, darkMode: boolean) {
  utils.rerender(
    <DashboardRuntimeProvider store={dashboardTestRuntimeStore}>
      <MemoryRouter>
        <Main {...panelProps} darkMode={darkMode} />
      </MemoryRouter>
    </DashboardRuntimeProvider>,
  );
}

describe('graphTooltip runtime propagation to timeseries charts', () => {
  beforeEach(() => {
    tooltipCalls.length = 0;
    axisBuilderCalls.length = 0;
    renderedCharts.length = 0;
    setGlobalState('dashboardMeta', { ...baseMeta, graphTooltip: 'default' });
  });

  it('rebuilds the chart with the new mode when dashboardMeta.graphTooltip changes at runtime', () => {
    const utils = renderMain();

    expect(tooltipCalls.length).toBeGreaterThan(0);
    expect(tooltipCalls[tooltipCalls.length - 1].graphTooltip).toBe('default');

    act(() => {
      setGlobalState('dashboardMeta', { ...(getGlobalState('dashboardMeta') as DashboardMeta), graphTooltip: 'sharedTooltip' });
    });
    rerenderMain(utils, false);

    expect(tooltipCalls[tooltipCalls.length - 1].graphTooltip).toBe('sharedTooltip');
  });

  it('rebuilds axis options with the new theme when darkMode changes at runtime', () => {
    const utils = renderMain(false);

    expect(axisBuilderCalls[axisBuilderCalls.length - 1]).toEqual(expect.objectContaining({ theme: 'light' }));

    rerenderMain(utils, true);

    expect(axisBuilderCalls[axisBuilderCalls.length - 1]).toEqual(expect.objectContaining({ theme: 'dark' }));
  });
});
