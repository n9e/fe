/** @jest-environment jsdom */
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';

import ESExplorer from './index';
import type { ESQueryWorkspace } from './useQueryWorkspace';
import { defaultBuilderValues } from './useQueryWorkspace';
import { esQueryBuilder } from 'plus:/datasource/elasticsearch/ExplorerNG/services';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';

let main: { workspace: ESQueryWorkspace; executeQuery: () => void };
let outerForm: FormInstance;
const generated = {
  sql: 'SELECT count(*) FROM "logs" WHERE @timestamp >= 1',
  mode: 'timeseries',
  time_key: 'ts',
  value_key: ['count'],
  label_key: ['host'],
};

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false, esIndexMode: 'indices' }) }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range) => range }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { ck: 'ck', doris: 'doris', elasticsearch: 'elasticsearch' }, IS_PLUS: true, IS_ENT: true }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer', QUERY_INPUT_MIN_WIDTH: 0 }));
jest.mock('../constants', () => ({
  NAME_SPACE: 'db_es',
  QUERY_CACHE_KEY: 'query_history',
  QUERY_CACHE_PICK_KEYS: ['sql'],
  DEFAULT_LOGS_PAGE_SIZE: 10,
}));
jest.mock('plus:/datasource/elasticsearch/ExplorerNG/services', () => ({ esQueryBuilder: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }), Trans: ({ children }) => children }));
jest.mock('@/components/HistoricalRecords/ConditionHistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/pages/logExplorer/components/SideBar', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('./SideBarNav', () => ({ __esModule: true, default: () => null }));
jest.mock('./utils/organizeFieldsLocalstorage', () => ({ getOrganizeFieldsFromLocalstorage: () => [], setOrganizeFieldsToLocalstorage: jest.fn() }));
jest.mock('./utils/calcInterval', () => ({ __esModule: true, default: jest.fn(() => '1m') }));
jest.mock('./Main', () => ({
  __esModule: true,
  default: (props) => {
    main = props;
    return (
      <>
        {['syntax', 'index', 'date_field', 'sql', 'query', 'range', 'sqlVizType', 'keys', 'filters'].map((key) => (
          <Form.Item key={key} name={['query', key]} hidden>
            <Input />
          </Form.Item>
        ))}
        <Form form={props.workspace.builderForm} component='div' initialValues={defaultBuilderValues}>
          {['filters', 'aggregates', 'mode', 'group_by', 'order_by', 'limit'].map((key) => (
            <Form.Item key={key} name={key} hidden>
              <Input />
            </Form.Item>
          ))}
        </Form>
      </>
    );
  },
}));

function Host() {
  const [form] = Form.useForm();
  outerForm = form;
  return (
    <Form
      form={form}
      initialValues={{
        datasourceValue: 7,
        datasourceCate: 'elasticsearch',
        query: { syntax: 'sql', index: 'logs-*', date_field: 'ts', range: { start: 1000, end: 2000 }, sql: 'SELECT original WHERE @timestamp >= 1' },
      }}
    >
      <Form.Item name='datasourceValue' hidden>
        <Input />
      </Form.Item>
      <Form.Item name='datasourceCate' hidden>
        <Input />
      </Form.Item>
      <ESExplorer tabKey='test' renderCommonSettings={() => null} />
    </Form>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (esQueryBuilder as jest.Mock).mockResolvedValue(generated);
});

it('maps ES generation without executing and applies the statement with its keys', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  await act(async () => {
    await main.workspace.convert();
  });
  expect(esQueryBuilder).toHaveBeenCalledWith(
    expect.objectContaining({
      cate: 'elasticsearch',
      datasource_id: 7,
      query: [expect.objectContaining({ index: 'logs-*', time_field: 'ts', from: 1000, to: 2000, mode: 'table' })],
    }),
  );
  expect(outerForm.getFieldValue(['query', 'sql'])).toBe(generated.sql);
  expect(outerForm.getFieldValue(['query', 'sqlVizType'])).toBe('timeseries');
  expect(outerForm.getFieldValue(['query', 'keys'])).toEqual({ valueKey: ['count'], labelKey: ['host'] });
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
  act(() => {
    main.workspace.builderForm.setFieldsValue({ group_by: ['host'], limit: 10 });
    main.workspace.markDirty();
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalledWith('query_history-7', expect.objectContaining({ sql: generated.sql })));
  expect(esQueryBuilder).toHaveBeenLastCalledWith(expect.objectContaining({ query: [expect.objectContaining({ group_by: ['host'], limit: 10 })] }));
});

it('does not leave a query trigger behind when converting swaps the result view', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  act(() => outerForm.setFieldsValue({ refreshFlag: 'refreshFlag_previous', query: { sqlVizType: 'table' } }));
  await act(async () => {
    await main.workspace.convert();
  });
  // The view switches to timeseries and remounts; the previous run's flag would make it query on its own.
  expect(outerForm.getFieldValue(['query', 'sqlVizType'])).toBe('timeseries');
  expect(outerForm.getFieldValue('refreshFlag')).toBeUndefined();
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
});

it('reports a missing index without changing or executing the current SQL', async () => {
  render(<Host />);
  act(() => {
    outerForm.setFieldsValue({ query: { index: undefined } });
    main.workspace.setAssistEnabled(true);
  });
  await act(async () => {
    await main.workspace.run();
  });
  expect(main.workspace.error).toEqual(new Error('query.index_required'));
  expect(outerForm.getFieldValue(['query', 'sql'])).toContain('original');
  expect(esQueryBuilder).not.toHaveBeenCalled();
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
});

it('enters hand-written mode when the query syntax leaves SQL', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  act(() => outerForm.setFieldsValue({ query: { syntax: 'kuery' } }));
  expect(main.workspace.assistEnabled).toBe(false);
});

it('runs the hand-written statement through the existing query pipeline', async () => {
  render(<Host />);
  act(() => {
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalledWith('query_history-7', expect.objectContaining({ sql: 'SELECT original WHERE @timestamp >= 1' })));
  expect(esQueryBuilder).not.toHaveBeenCalled();
  expect(outerForm.getFieldValue('refreshFlag')).toBeDefined();
});
