/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import SharedChart from '@/pages/chart/Main';
import SharedDashboard from '@/pages/dashboard/Share';
import Main from './Main';
import { getGlobalState, setGlobalState } from '../../../globalState';
import type { DashboardMeta } from '../../../globalState';

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/pages/dashboard/Detail/Detail', () => ({ __esModule: true, default: MockPanel }));
jest.mock('@/pages/dashboard/Renderer/Renderer', () => ({ __esModule: true, default: MockPanel }));
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
jest.mock('../../../Editor/config', () => ({ defaultOptionsValues: { thresholds: { mode: 'absolute' } }, calcsOptions: [] }));
jest.mock('./components/ResetZoomButton', () => () => null);
jest.mock('./components/Annotation/AddButton', () => () => null);
jest.mock('./components/Annotation/annotationsPlugin', () => ({
  __esModule: true,
  default: () => ({ hooks: {} }),
  Markers: () => null,
}));

const tooltipCalls: Array<{ graphTooltip?: string; id?: string; pinningEnabled?: boolean }> = [];
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

function MockPanel({ isPreview }: { isPreview?: boolean }) {
  return (
    <Main
      id='test-panel'
      isPreview={isPreview}
      frames={[[1000, 2000]] as never}
      baseSeries={[]}
      darkMode={false}
      width={400}
      height={200}
      panel={{ type: 'timeseries', custom: {}, options: {}, targets: [] } as never}
      series={[]}
      annotations={[]}
    />
  );
}

describe('graphTooltip runtime propagation to timeseries charts', () => {
  beforeEach(() => {
    tooltipCalls.length = 0;
    renderedCharts.length = 0;
    setGlobalState('dashboardMeta', { ...baseMeta, graphTooltip: 'default' });
  });

  it.each([
    ['shared dashboard', <SharedDashboard />, false],
    ['shared panel', <SharedChart width={400} item={{ dataProps: { id: 'shared' } }} range={{ start: 'now-1h', end: 'now' }} />, false],
    ['dashboard panel preview', <MockPanel isPreview />, true],
  ] as const)('sets click-to-pin for the %s', (_name, page, pinningEnabled) => {
    render(<MemoryRouter>{page}</MemoryRouter>);
    expect(tooltipCalls[tooltipCalls.length - 1].pinningEnabled).toBe(pinningEnabled);
  });

  it('rebuilds the chart with the new mode when dashboardMeta.graphTooltip changes at runtime', () => {
    const utils = render(
      <MemoryRouter>
        <MockPanel />
      </MemoryRouter>,
    );

    expect(tooltipCalls.length).toBeGreaterThan(0);
    expect(tooltipCalls[tooltipCalls.length - 1].graphTooltip).toBe('default');

    act(() => {
      setGlobalState('dashboardMeta', { ...(getGlobalState('dashboardMeta') as DashboardMeta), graphTooltip: 'sharedTooltip' });
    });
    utils.rerender(
      <MemoryRouter>
        <MockPanel />
      </MemoryRouter>,
    );

    expect(tooltipCalls[tooltipCalls.length - 1].graphTooltip).toBe('sharedTooltip');
  });
});
