/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';

import { DashboardRuntimeProvider, createDashboardRuntimeStore } from '../../globalState';
import Main from './Main';
import type { DashboardQueryHookResult } from '../datasource/types';
import type { IPanel } from '../../types';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/components/TimeRangePicker', () => ({ describeTimeRange: () => '' }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  useReplaceTemplateVariables: () => (value: string) => value,
}));
jest.mock('../../Components/Markdown', () => ({ __esModule: true, default: ({ content }: { content: string }) => <div>{content}</div> }));
jest.mock('../Inspect', () => () => null);
jest.mock('../components/CloneIcon', () => () => null);
jest.mock('../components/PanelEmpty', () => () => <div>empty</div>);
jest.mock('./TimeSeriesNG', () => () => <div data-testid='timeseries-body' />);
jest.mock('./Stat', () => () => null);
// Table 通过 ref 暴露导出能力，这里保留 ref 转发以便验证菜单导出链路
const mockTableExportCsv = jest.fn();
jest.mock('./Table', () => ({
  __esModule: true,
  default: require('react').forwardRef((_props: unknown, ref: unknown) => {
    require('react').useImperativeHandle(ref, () => ({ exportCsv: mockTableExportCsv }));
    return null;
  }),
}));
jest.mock('./TableNG', () => () => null);
jest.mock('./Pie', () => () => null);
jest.mock('./Hexbin', () => () => null);
jest.mock('./BarGauge', () => () => null);
jest.mock('./Gauge', () => () => null);
jest.mock('./Iframe', () => () => <div data-testid='iframe-body' />);
jest.mock('./Heatmap', () => () => null);
jest.mock('./BarChart', () => () => null);

const time = {
  start: moment('2026-09-08T00:00:00.000Z'),
  end: moment('2026-09-08T01:00:00.000Z'),
};

const queryResult: DashboardQueryHookResult = {
  retry: jest.fn(),
  query: [],
  series: [],
  errorsByRef: {},
  error: '',
  loading: false,
  loaded: false,
  range: time,
  revision: 0,
};

/** 为面板渲染测试提供独立仪表盘运行时，避免变量执行状态污染其他用例。 */
function renderWithDashboardRuntime(ui: React.ReactElement, store = createDashboardRuntimeStore()) {
  return render(ui, {
    wrapper: ({ children }) => <DashboardRuntimeProvider store={store}>{children}</DashboardRuntimeProvider>,
  });
}

test('text panel renders its body before the query state is loaded', () => {
  renderWithDashboardRuntime(
    <Main
      id='text-panel'
      panelWidth={400}
      values={
        {
          id: 'text-panel',
          type: 'text',
          name: 'Panel Title',
          description: '',
          layout: { h: 4, w: 12, x: 0, y: 0, i: 'text-panel' },
          targets: [{ refId: 'A' }],
          custom: { content: '$project' },
          options: {},
          overrides: [],
        } satisfies IPanel
      }
      annotations={[]}
      controllersVisible={false}
      queryResult={queryResult}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  expect(screen.getByText('$project')).toBeInTheDocument();
  expect(document.querySelector('.renderer-body')).toBeInTheDocument();
});

/** 验证变量链阻断查询时，首次加载面板仍立即显示骨架和顶部活动条。 */
test('shows the loading skeleton while variables are executing before the panel query starts', () => {
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variableExecution', { sessionId: 1, isExecuting: true, revision: 1 });
  const values: IPanel = {
    id: 'variables-panel',
    type: 'timeseries',
    name: 'Variables panel',
    description: '',
    layout: { h: 4, w: 12, x: 0, y: 0, i: 'variables-panel' },
    targets: [{ refId: 'A' }],
    custom: {},
    options: {},
    overrides: [],
  };

  renderWithDashboardRuntime(
    <Main
      id='variables-panel'
      panelWidth={400}
      values={values}
      annotations={[]}
      controllersVisible={false}
      queryResult={queryResult}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
    store,
  );

  expect(screen.getAllByLabelText('common:loading')).toHaveLength(2);
  expect(screen.getByTestId('panel-loading-bar')).toBeInTheDocument();
  expect(screen.getByTestId('panel-loading-chart-icon')).toBeInTheDocument();
  expect(screen.queryByTestId('timeseries-body')).not.toBeInTheDocument();
});

test('anonymous-share-equivalent panels keep read-only actions but hide edit and delete', () => {
  renderWithDashboardRuntime(
    <Main
      id='readonly-panel'
      panelWidth={400}
      values={
        {
          id: 'readonly-panel',
          type: 'text',
          name: 'Read-only panel',
          description: '',
          layout: { h: 4, w: 12, x: 0, y: 0, i: 'readonly-panel' },
          targets: [{ refId: 'A' }],
          custom: { content: 'readonly' },
          options: {},
          overrides: [],
        } satisfies IPanel
      }
      annotations={[]}
      controllersVisible
      isAuthorized={false}
      queryResult={queryResult}
      containerEleRef={{ current: document.body as HTMLDivElement }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  fireEvent.click(document.querySelector('.renderer-header-controller')!);

  expect(screen.getByText('common:btn.view')).toBeInTheDocument();
  expect(screen.getByText('refresh_btn')).toBeInTheDocument();
  expect(screen.queryByText('common:btn.edit')).not.toBeInTheDocument();
  expect(screen.queryByText('common:btn.delete')).not.toBeInTheDocument();
});

/** 验证首次加载显示骨架和顶部进度条，完成后恢复图表渲染。 */
test('shows the panel skeleton and loading bar only before the first result is available', () => {
  const values: IPanel = {
    id: 'timeseries-panel',
    type: 'timeseries',
    name: 'Timeseries panel',
    description: '',
    layout: { h: 4, w: 12, x: 0, y: 0, i: 'timeseries-panel' },
    targets: [{ refId: 'A' }],
    custom: {},
    options: {},
    overrides: [],
  };
  const { rerender } = renderWithDashboardRuntime(
    <Main
      id='timeseries-panel'
      panelWidth={400}
      values={values}
      annotations={[]}
      controllersVisible={false}
      queryResult={{ ...queryResult, loading: true }}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  expect(screen.getAllByLabelText('common:loading')).toHaveLength(2);
  expect(screen.getByTestId('panel-loading-chart-icon')).toBeInTheDocument();
  expect(screen.getByTestId('panel-loading-bar')).toBeInTheDocument();
  expect(screen.getByTestId('panel-loading-bar')).toHaveStyle({ animationDuration: '960ms' });
  expect(document.querySelector('.renderer-header-controllers .anticon-sync')).not.toBeInTheDocument();

  rerender(
    <Main
      id='timeseries-panel'
      panelWidth={400}
      values={values}
      annotations={[]}
      controllersVisible={false}
      queryResult={{
        ...queryResult,
        loading: true,
        loaded: true,
        series: [
          {
            id: 'A',
            refId: 'A',
            metric: {},
            data: [[1, 1]],
            mode: 'timeSeries',
            isExp: false,
          },
        ],
      }}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  expect(screen.queryByTestId('panel-loading-chart-icon')).not.toBeInTheDocument();
  expect(screen.getByTestId('panel-loading-bar')).toBeInTheDocument();
  expect(screen.getByTestId('timeseries-body')).toBeInTheDocument();

  rerender(
    <Main
      id='timeseries-panel'
      panelWidth={400}
      values={values}
      annotations={[]}
      controllersVisible={false}
      queryResult={{
        ...queryResult,
        loaded: true,
        series: [
          {
            id: 'A',
            refId: 'A',
            metric: {},
            data: [[1, 1]],
            mode: 'timeSeries',
            isExp: false,
          },
        ],
      }}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  expect(screen.queryByLabelText('common:loading')).not.toBeInTheDocument();
  expect(screen.queryByTestId('panel-loading-bar')).not.toBeInTheDocument();
  expect(screen.getByTestId('timeseries-body')).toBeInTheDocument();
});

/** 表格导出依赖渲染器通过 ref 暴露的 exportCsv，这里验证菜单到渲染器的完整链路。 */
test('table panels export CSV through the panel menu', () => {
  const values: IPanel = {
    id: 'table-panel',
    type: 'table',
    name: 'Table panel',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'table-panel' },
    targets: [{ refId: 'A' }],
    custom: {},
    options: {},
    overrides: [],
  };

  renderWithDashboardRuntime(
    <Main
      id='table-panel'
      panelWidth={400}
      values={values}
      annotations={[]}
      controllersVisible
      queryResult={{
        ...queryResult,
        loaded: true,
        series: [
          {
            id: 'A',
            refId: 'A',
            metric: {},
            data: [[1, 1]],
            mode: 'timeSeries',
            isExp: false,
          },
        ],
      }}
      containerEleRef={{ current: document.body as HTMLDivElement }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  fireEvent.click(document.querySelector('.renderer-header-controller')!);
  fireEvent.click(screen.getByText('export_btn'));

  expect(mockTableExportCsv).toHaveBeenCalledTimes(1);
});

const queryPanel: IPanel = {
  id: 'query-panel',
  type: 'timeseries',
  name: 'Query panel',
  description: '',
  layout: { h: 4, w: 12, x: 0, y: 0, i: 'query-panel' },
  targets: [{ refId: 'A' }],
  custom: {},
  options: {},
  overrides: [],
};

test.each([
  ['refresh_btn', 1],
  ['inspect_btn', 0],
])('%s only refreshes when requested and never changes dashboard time', (action, expectedRetryCalls) => {
  const retry = jest.fn();
  const setTime = jest.fn();
  const setInspect = jest.fn();
  renderWithDashboardRuntime(
    <Main
      id='query-panel'
      values={queryPanel}
      annotations={[]}
      controllersVisible
      queryResult={{ ...queryResult, loaded: true, retry }}
      containerEleRef={{ current: document.body as HTMLDivElement }}
      time={time}
      setTime={setTime}
      inspect={false}
      setInspect={setInspect}
      setViewModalVisible={jest.fn()}
    />,
  );
  fireEvent.click(document.querySelector('.renderer-header-controller')!);
  fireEvent.click(screen.getByText(action));
  expect(retry).toHaveBeenCalledTimes(expectedRetryCalls);
  expect(setTime).not.toHaveBeenCalled();
  if (action === 'inspect_btn') expect(setInspect).toHaveBeenCalledWith(true);
});

test('shows a missing-variable error icon and hides refresh actions', async () => {
  const error = 'Query A references missing variable(s): source, job';
  const setInspect = jest.fn();
  const retry = jest.fn();
  renderWithDashboardRuntime(
    <Main
      id='query-panel'
      values={queryPanel}
      annotations={[]}
      controllersVisible
      queryResult={{
        ...queryResult,
        loaded: true,
        error,
        retry,
        requestReference: {
          request: {
            url: '/api/n9e/v2/query-batch',
            method: 'POST',
            data: { status: 'not_sent', reason: error, targets: queryPanel.targets },
          },
        },
      }}
      containerEleRef={{ current: document.body as HTMLDivElement }}
      time={time}
      inspect={false}
      setInspect={setInspect}
      setViewModalVisible={jest.fn()}
    />,
  );
  expect(screen.queryByText('empty')).not.toBeInTheDocument();
  expect(screen.getByTestId('panel-error-icon')).toBeInTheDocument();
  expect(screen.queryByText('refresh_btn')).not.toBeInTheDocument();
  const icon = document.querySelector('.renderer-header-error');
  expect(icon).toBeInTheDocument();
  fireEvent.mouseEnter(icon!);
  expect(await screen.findByText(error)).toBeInTheDocument();
  fireEvent.click(document.querySelector('.renderer-header-controller')!);
  expect(screen.queryByText('refresh_btn')).not.toBeInTheDocument();
  expect(retry).not.toHaveBeenCalled();
});

test('shows an error icon and retains refresh actions after a request fails without data', () => {
  const retry = jest.fn();
  renderWithDashboardRuntime(
    <Main
      id='query-panel'
      values={queryPanel}
      annotations={[]}
      controllersVisible
      queryResult={{
        ...queryResult,
        loaded: true,
        error: 'request failed',
        retry,
        query: [
          {
            type: 'Dashboard Query',
            request: {
              url: '/api/n9e/v2/query-batch',
              method: 'POST',
              data: { from: 0, to: 0, queries: [] },
            },
            response: { results: [] },
          },
        ],
      }}
      containerEleRef={{ current: document.body as HTMLDivElement }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );
  expect(screen.getByTestId('panel-error-icon')).toBeInTheDocument();
  fireEvent.click(screen.getByText('refresh_btn'));
  expect(retry).toHaveBeenCalledTimes(1);
});
