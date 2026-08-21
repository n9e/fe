/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import moment from 'moment';

import dashboardMigrator from '@/pages/dashboard/Detail/utils/dashboardMigrator';
import { createCommonStateWrapper } from '@/test/renderWithProviders';
import { buildLegacyDashboard, catesUnderTest, legacyLogsPanelSpecByCate, legacyPanelSpecByCate } from '@/pages/dashboard/test/fixtures/legacyDashboardsByCate';
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

describe('legacy dashboard panel rendering by cate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDashboardGlobalState();
  });

  it.each(catesUnderTest)('migrates and renders a legacy %s panel', async (cate) => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const spec = legacyPanelSpecByCate[cate];
      const panel = dashboardMigrator(buildLegacyDashboard(spec)).panels[0] as unknown as React.ComponentProps<typeof Renderer>['values'];
      render(<Renderer id={`panel-${cate}`} isPreview panelWidth={800} time={time} values={panel} annotations={[]} />, {
        wrapper: createCommonStateWrapper({ datasourceList: [] }),
      });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(fetchDashboardQueryMock.mock.calls[0][0].queries[0]).toMatchObject({ ref_id: 'A', datasource: { cate, id: spec.datasourceValue } });
      expect(screen.getByTestId('dashboard-chart')).toHaveTextContent('1');
    } finally {
      jest.useRealTimers();
    }
  });

  it.each(['elasticsearch', 'aliyun-sls'] as const)('migrates and renders a legacy %s raw (logs) panel', async (cate) => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse([{ ref_id: 'A', status: 'success', result_type: 'logs', records: [{ fields: { message: 'hello' } }] }]));
      const spec = legacyLogsPanelSpecByCate[cate];
      const panel = dashboardMigrator(buildLegacyDashboard(spec)).panels[0] as unknown as React.ComponentProps<typeof Renderer>['values'];
      render(<Renderer id={`panel-${cate}-logs`} isPreview panelWidth={800} time={time} values={panel} annotations={[]} />, {
        wrapper: createCommonStateWrapper({ datasourceList: [] }),
      });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(fetchDashboardQueryMock.mock.calls[0][0].queries[0]).toMatchObject({ ref_id: 'A', result_type: 'logs', datasource: { cate, id: spec.datasourceValue } });
      expect(screen.getByTestId('dashboard-chart')).toHaveTextContent('1');
    } finally {
      jest.useRealTimers();
    }
  });
});
