/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import Raw from './index';
import { getFullFields, getLogsQuery } from '../../../services';

jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range: any) => range }));
jest.mock('@/utils/getTextWidth', () => () => 100);
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('../../../services', () => ({ getFullFields: jest.fn(), getLogsQuery: jest.fn(), getHistogram: jest.fn().mockResolvedValue([]) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (s: string) => s }), Trans: () => null }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { elasticsearch: 'elasticsearch' }, IS_PLUS: false }));
jest.mock('@/pages/logExplorer/components/RenderValue/useFieldConfig', () => () => ({}));
jest.mock('@/pages/logExplorer/components/LogOrderContext', () => () => null);
jest.mock('@/pages/logExplorer/components/LogOrderContext/LogOrderMeta', () => ({
  __esModule: true,
  default: () => null,
  omitLogOrderKeys: (x: any) => x,
  withoutLogOrderFields: (x: any) => x,
}));
jest.mock('plus:/components/LogDownload/DownloadModal', () => () => null, { virtual: true });
jest.mock('@/pages/logExplorer/components/LogsViewer/components/LogFieldValue/tokenValue', () => ({ getDateTokenDisplayValue: () => '' }));
jest.mock('@/pages/logExplorer/components/LogsViewer', () => (props: any) => <div>{props.optionsExtraRender}</div>);
jest.mock('@fc-components/es-query', () => ({ buildESQueryFromKuery: () => ({ filter: [] }) }));
const fields = [
  { field: 'ts', type: 'date' },
  { field: '__log_stream_id__', type: 'keyword' },
  { field: '__log_seq__', type: 'long' },
];
function Harness() {
  const [form] = Form.useForm();
  const [params, setParams] = React.useState({ current: 1, pageSize: 20, reverse: true, refreshFlag: 'initial' });
  const paramsRef = React.useRef(params);
  paramsRef.current = params;
  const rangeRef = React.useRef<any>();
  const snapRangeRef = React.useRef({});
  return (
    <Form
      form={form}
      initialValues={{ refreshFlag: 'initial', datasourceValue: 1, query: { index: 'logs-*', date_field: 'ts', range: { start: 1793377800000, end: 1793377900000 } } }}
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
      <Raw
        indexData={[]}
        tableSelector={{ antd: '.unused', rgd: '.unused' }}
        rangeRef={rangeRef}
        snapRangeRef={snapRangeRef}
        organizeFields={[]}
        setOrganizeFields={() => {}}
        handleValueFilter={() => {}}
        setExecuteLoading={() => {}}
        executeQuery={() => {}}
        setInterval={() => {}}
        intervalFixedRef={React.useRef(false)}
        serviceParams={params}
        setServiceParams={setParams}
        getServiceParams={() => paramsRef.current}
      />
    </Form>
  );
}
beforeAll(() => Object.defineProperty(window, 'matchMedia', { writable: true, value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }) }));
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
it('waits for metadata and keeps the same three-key sort on page two', async () => {
  let resolveFields: (value: any) => void = () => {};
  (getFullFields as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      resolveFields = resolve;
    }),
  );
  (getLogsQuery as jest.Mock).mockResolvedValue({ list: [{ _source: { ts: 1793377800000, message: 'test' } }], total: 40 });
  const view = render(<Harness />);
  await waitFor(() => expect(getFullFields).toHaveBeenCalled());
  expect(getLogsQuery).not.toHaveBeenCalled();
  resolveFields({ allFields: fields });
  await waitFor(() => expect(getLogsQuery).toHaveBeenCalled());
  fireEvent.click(await view.findByTitle('2'));
  await waitFor(() => expect((getLogsQuery as jest.Mock).mock.calls.some((call) => JSON.parse(call[1].trim().split('\n')[1]).from === 20)).toBe(true));
  const bodies = (getLogsQuery as jest.Mock).mock.calls.map((call) => JSON.parse(call[1].trim().split('\n')[1]));
  for (const body of bodies)
    expect(body.sort).toEqual([
      { ts: { order: 'desc', unmapped_type: 'date' } },
      { __log_stream_id__: { order: 'desc', unmapped_type: 'keyword' } },
      { __log_seq__: { order: 'desc', unmapped_type: 'long' } },
    ]);
  expect(getFullFields).toHaveBeenCalledTimes(1);
});

it('shows metadata failure and retries before running the log query', async () => {
  (getFullFields as jest.Mock).mockRejectedValueOnce(new Error('mapping unavailable')).mockResolvedValue({ allFields: fields });
  (getLogsQuery as jest.Mock).mockResolvedValue({ list: [{ _source: { ts: 1793377800000, message: 'test' } }], total: 40 });
  const view = render(<Harness />);
  expect(await view.findByRole('alert')).toHaveTextContent('metadata_load_failed');
  expect(getLogsQuery).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole('button', { name: 'metadata_retry' }));
  await waitFor(() => expect(getLogsQuery).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(view.queryByRole('alert')).toBeNull());
  expect(getFullFields).toHaveBeenCalledTimes(2);
  const body = JSON.parse((getLogsQuery as jest.Mock).mock.calls[0][1].trim().split('\n')[1]);
  expect(body.from).toBe(0);
  expect(body.sort).toHaveLength(3);
});
