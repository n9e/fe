/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import Query from './index';
import { getDorisLogsQuery } from '../../../services';
import { NG_QUERY_LOGS_OPTIONS_CACHE_KEY } from '../../../constants';

jest.mock('../../../services', () => ({ getDorisLogsQuery: jest.fn(), getDorisHistogram: jest.fn().mockResolvedValue([]) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (s: string) => s }), Trans: () => null }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' }, IS_ENT: false, IS_PLUS: false }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range: any) => range }));
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/pages/logExplorer/components/RenderValue/useFieldConfig', () => () => ({}));
jest.mock('@/pages/logExplorer/components/LogOrderContext', () => () => null);
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
  </div>
));
jest.mock('./QueryBuilderFilters', () => () => null);
jest.mock('./useQuerySyntaxError', () => () => ({}));
jest.mock('../../utils/tableElementMethods', () => ({ scrollToTop: () => {}, getIsAtBottom: () => true }));
jest.mock('plus:/parcels/DorisLogAnalysis', () => ({ bindDorisLogAnalysisRows: () => {}, captureDorisLogAnalysisRequest: () => {}, useDorisLogAnalysisViewerProps: () => ({}) }), {
  virtual: true,
});
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
it.each([true, false])('only enables further paging when supported=%s', async (supported) => {
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({ list: [{ ts: '2026-10-31 00:30:00', message: 'test' }], total: 1000, pagination_supported: supported });
  const view = render(<Harness />);
  const page = await view.findByTitle('2');
  const before = (getDorisLogsQuery as jest.Mock).mock.calls.length;
  fireEvent.click(page);
  if (supported) {
    await waitFor(() => expect((getDorisLogsQuery as jest.Mock).mock.calls.length).toBeGreaterThan(before));
    expect(view.queryByText('pagination_requires_order_keys')).toBeNull();
  } else {
    expect(view.getByText('pagination_requires_order_keys')).toBeTruthy();
    expect((getDorisLogsQuery as jest.Mock).mock.calls.length).toBe(before);
  }
});
it('does not load another batch in infinite scroll when unsupported', async () => {
  localStorage.setItem(NG_QUERY_LOGS_OPTIONS_CACHE_KEY, JSON.stringify({ pageLoadMode: 'infiniteScroll' }));
  (getDorisLogsQuery as jest.Mock).mockResolvedValue({ list: [{ ts: '2026-10-31 00:30:00', message: 'test' }], total: 1000, pagination_supported: false });
  const view = render(<Harness />);
  await view.findByText('pagination_requires_order_keys');
  const before = (getDorisLogsQuery as jest.Mock).mock.calls.length;
  fireEvent.scroll(view.getByTestId('viewer'));
  expect((getDorisLogsQuery as jest.Mock).mock.calls.length).toBe(before);
});
