/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import Query from './index';
import { getDorisLogsQuery, getDorisContextLogs } from '../../../services';
import { NG_QUERY_LOGS_OPTIONS_CACHE_KEY } from '../../../constants';

jest.mock('../../../services', () => ({ getDorisContextLogs: jest.fn().mockResolvedValue({}), getDorisLogsQuery: jest.fn(), getDorisHistogram: jest.fn().mockResolvedValue([]) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (s: string) => s }), Trans: () => null }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' }, IS_ENT: false, IS_PLUS: false }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range: any) => range }));
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/pages/logExplorer/components/RenderValue/useFieldConfig', () => () => ({}));
jest.mock('@/pages/logExplorer/components/LogOrderContext', () => (props: any) => (
  <button
    data-testid={`context-${props.variant}`}
    data-order-supported={String(props.orderSupported)}
    onClick={() => props.fetchPage({ stream_id: props.log.__log_stream_id__, seq: props.log.__log_seq__, time: props.log[props.timeField], back_lines: 30, forward_lines: 30 })}
  >
    {props.log?.__log_stream_id__}
  </button>
));
jest.mock('@/pages/logExplorer/components/LogOrderContext/LogOrderMeta', () => ({
  __esModule: true,
  default: () => null,
  omitLogOrderKeys: (x: any) => x,
  withoutLogOrderFields: (x: any) => x,
}));
jest.mock('@/pages/logExplorer/components/LogsViewer/components/HistogramDownloadModal', () => () => null);
jest.mock('@/pages/logExplorer/components/LogsViewer', () => (props: any) => (
  <div data-testid='viewer' onScrollCapture={props.onScrollCapture}>
    {props.optionsExtraRender}
    {props.rowPrefixRender?.({ ___raw___: { ts: '2026-10-31 00:30:00', __log_stream_id__: 'file-1', __log_seq__: '1' } })}
    {props.logViewerExtraRender?.({ ___raw___: { ts: '2026-10-31 00:30:00', __log_stream_id__: 'file-1', __log_seq__: '1' } })}
  </div>
));
jest.mock('./QueryBuilderFilters', () => () => null);
jest.mock('./useQuerySyntaxError', () => () => ({}));
jest.mock('../../utils/tableElementMethods', () => ({ scrollToTop: () => {}, getIsAtBottom: () => true }));
jest.mock(
  'plus:/parcels/DorisLogAnalysis',
  () => ({
    bindDorisLogAnalysisRows: () => {},
    captureDorisLogAnalysisRequest: () => {},
    useDorisLogAnalysisViewerProps: jest.fn(() => ({})),
  }),
  { virtual: true },
);
function Harness() {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      initialValues={{
        refreshFlag: 'initial',
        datasourceValue: 1,
        query: { database: 'logs', table: 'app', time_field: 'ts', range: { start: 1793377800000, end: 1793377900000 } },
      }}
    >
      <Form.Item name='refreshFlag' hidden>
        <input />
      </Form.Item>
      <Form.Item name='datasourceValue' hidden>
        <input />
      </Form.Item>
      <Form.Item name='query' hidden>
        <input />
      </Form.Item>
      <Query
        indexData={[]}
        tableSelector={{ antd: '.unused', rgd: '.unused' }}
        rangeRef={React.useRef<any>()}
        snapRangeRef={React.useRef({})}
        organizeFields={[]}
        setOrganizeFields={() => {}}
        handleValueFilter={() => {}}
        setExecuteLoading={() => {}}
        executeQuery={() => {}}
        setStackByField={() => {}}
      />
    </Form>
  );
}
beforeAll(() => Object.defineProperty(window, 'matchMedia', { writable: true, value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }) }));
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  localStorage.clear();
});
it.each([true, false, undefined])('preserves offset paging when order support is %s', async (supported) => {
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({ list: [{ ts: '2026-10-31 00:30:00', message: 'test' }], total: 1000, pagination_supported: supported });
  const view = render(<Harness />);
  const page = await view.findByTitle('2');
  fireEvent.click(page);
  await waitFor(() => expect((getDorisLogsQuery as jest.Mock).mock.calls.slice(-1)[0][0].query[0].offset).toBeGreaterThan(0));
  expect(view.queryByText('pagination_requires_order_keys')).toBeNull();
});
it.each([false, true])('preserves infinite scrolling and selects the cursor only for rows with order fields: %s', async (ordered) => {
  localStorage.setItem(`${NG_QUERY_LOGS_OPTIONS_CACHE_KEY}@options`, JSON.stringify({ pageLoadMode: 'infiniteScroll' }));
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({
    list: [{ ts: '2026-10-31 00:30:00', message: 'test', ...(ordered ? { __log_stream_id__: 'file-1', __log_seq__: '9007199254740993' } : {}) }],
    total: 1000,
    pagination_supported: ordered,
  });
  const view = render(<Harness />);
  await waitFor(() => expect((getDorisLogsQuery as jest.Mock).mock.calls.length).toBeGreaterThan(0));
  await waitFor(() => expect(view.getByTestId('viewer')).toBeTruthy());
  fireEvent.scroll(view.getByTestId('viewer'));
  await waitFor(() => expect((getDorisLogsQuery as jest.Mock).mock.calls.slice(-1)[0][0].query[0].offset).toBeGreaterThan(0));
  expect((getDorisLogsQuery as jest.Mock).mock.calls.slice(-1)[0][0].query[0].search_after).toEqual(
    ordered ? { time: '2026-10-31 00:30:00', stream_id: 'file-1', seq: '9007199254740993' } : undefined,
  );
});

it.each([false, true])('renders context callbacks with AI extensions present: %s', async (withAI) => {
  const { useDorisLogAnalysisViewerProps } = require('plus:/parcels/DorisLogAnalysis');
  const rowPrefixRender = jest.fn((row) => <span data-testid='ai-row'>{row.___raw___.__log_stream_id__}</span>);
  const logViewerExtraRender = jest.fn((row) => <span data-testid='ai-detail'>{row.___raw___.__log_seq__}</span>);
  useDorisLogAnalysisViewerProps.mockReturnValue(withAI ? { rowPrefixRender, logViewerExtraRender } : {});
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({ list: [{ ts: '2026-10-31 00:30:00', message: 'test' }], total: 1, pagination_supported: true });
  const view = render(<Harness />);
  expect(await view.findByTestId('context-icon')).toHaveTextContent('file-1');
  expect(view.getByTestId('context-button')).toHaveTextContent('file-1');
  if (withAI) {
    expect(view.getByTestId('ai-row')).toHaveTextContent('file-1');
    expect(view.getByTestId('ai-detail')).toHaveTextContent('1');
    expect(rowPrefixRender).toHaveBeenCalled();
    expect(logViewerExtraRender).toHaveBeenCalled();
  } else {
    expect(view.queryByTestId('ai-row')).toBeNull();
    expect(view.queryByTestId('ai-detail')).toBeNull();
  }
});

it.each([true, false, undefined])('forwards context parameters and order support %s', async (supported) => {
  const { useDorisLogAnalysisViewerProps } = require('plus:/parcels/DorisLogAnalysis');
  useDorisLogAnalysisViewerProps.mockReturnValue({});
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({ list: [{ ts: '2026-10-31 00:30:00', message: 'test' }], total: 1, pagination_supported: supported });
  const view = render(<Harness />);
  const icon = await view.findByTestId('context-icon');
  const detail = view.getByTestId('context-button');
  expect(icon).toHaveAttribute('data-order-supported', String(supported));
  expect(detail).toHaveAttribute('data-order-supported', String(supported));
  fireEvent.click(icon);
  fireEvent.click(detail);
  expect(getDorisContextLogs).toHaveBeenCalledTimes(2);
  for (const [request] of (getDorisContextLogs as jest.Mock).mock.calls) {
    expect(request).toEqual({
      cate: 'doris',
      datasource_id: 1,
      query: [{ database: 'logs', table: 'app', time_field: 'ts', stream_id: 'file-1', seq: '1', time: '2026-10-31 00:30:00', back_lines: 30, forward_lines: 30 }],
    });
  }
});
