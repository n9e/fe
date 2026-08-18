/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import moment from 'moment';

import dashboardMigrator from '@/pages/dashboard/Detail/utils/dashboardMigrator';
import { createCommonStateWrapper } from '@/test/renderWithProviders';
import { legacyEsPanel, legacyPromTimeseries, mixedV4Dashboard } from '@/pages/dashboard/test/fixtures/legacyDashboards';
import { createMockQueryResponse } from '@/pages/dashboard/test/fixtures/dashboardQuery';
import { resetDashboardGlobalState } from '@/test/resetGlobalState';

import Renderer from './index';
import { fetchDashboardQuery } from '../datasource/service';

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/utils/constant', () => ({ N9E_PATHNAME: 'n9e' }));
jest.mock('@/components/TimeRangePicker', () => () => <div />);
jest.mock('@/components/TimeRangePicker/utils', () => ({ parseRange: (range: unknown) => range }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('ahooks', () => ({ ...jest.requireActual('ahooks'), useInViewport: () => [true] }));
jest.mock('@ant-design/icons', () => ({ CloseOutlined: () => null }));
jest.mock('./Main', () => ({
  __esModule: true,
  default: ({ queryResult }: { queryResult: { series: unknown[]; error: string } }) => <div data-testid='dashboard-chart'>{queryResult.error || queryResult.series.length}</div>,
}));
jest.mock('../datasource/service', () => ({ fetchDashboardQuery: jest.fn() }));
jest.mock('../datasource/queryStep', () => ({ getDashboardQueryStep: () => 30 }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  replaceDatasourceVariables: (value: number | string) => value,
}));

const fetchDashboardQueryMock = fetchDashboardQuery as jest.Mock;
const time = { start: moment('2026-07-24T00:00:00.000Z'), end: moment('2026-07-24T01:00:00.000Z') };

describe('legacy dashboard panel rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDashboardGlobalState();
  });

  it.each([
    [legacyPromTimeseries, [{ ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series' }]],
    [
      legacyEsPanel,
      [
        { ref_id: 'A', query: { filter_language: 'kql' } },
        { ref_id: 'A__value_1', query: { filter_language: 'kql' } },
      ],
    ],
    [
      mixedV4Dashboard,
      [
        { ref_id: 'A', datasource: { id: 1 } },
        { ref_id: 'B', datasource: { id: 2 } },
      ],
    ],
  ])('migrates and requests a compatible panel configuration', async (fixture, expectedQueries) => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const panel = dashboardMigrator(fixture).panels[0] as React.ComponentProps<typeof Renderer>['values'];
      render(<Renderer id='panel-1' isPreview panelWidth={800} time={time} values={panel} annotations={[]} />, { wrapper: createCommonStateWrapper({ datasourceList: [] }) });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(fetchDashboardQueryMock.mock.calls[0][0].queries).toMatchObject(expectedQueries);
      expect(screen.getByTestId('dashboard-chart')).toHaveTextContent('1');
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders ref-level query errors instead of throwing', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue({ results: [{ ref_id: 'A', status: 'error', error: { code: 'QUERY_FAILED', message: 'backend down', retryable: true } }] });
      const panel = dashboardMigrator(legacyPromTimeseries).panels[0] as React.ComponentProps<typeof Renderer>['values'];
      render(<Renderer id='panel-1' isPreview panelWidth={800} time={time} values={panel} annotations={[]} />, { wrapper: createCommonStateWrapper({ datasourceList: [] }) });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(screen.getByTestId('dashboard-chart')).toHaveTextContent('A: backend down');
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not repeat a loaded request when props are unchanged', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const panel = dashboardMigrator(legacyPromTimeseries).panels[0] as React.ComponentProps<typeof Renderer>['values'];
      const view = render(<Renderer id='panel-1' isPreview panelWidth={800} time={time} values={panel} annotations={[]} />, {
        wrapper: createCommonStateWrapper({ datasourceList: [] }),
      });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
        await Promise.resolve();
      });
      view.rerender(<Renderer id='panel-1' isPreview panelWidth={800} time={time} values={panel} annotations={[]} />);
      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
