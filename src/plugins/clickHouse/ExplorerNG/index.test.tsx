/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';

import CKExplorer from './index';
import type { CKQueryWorkspace } from './useQueryWorkspace';
import { defaultBuilderValues } from './useQueryWorkspace';
import { buildSql } from '../services';
import { setLocalQueryHistory } from '@/components/HistoricalRecords';
import { setLocalQueryHistory as setConditionHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';

let main: { workspace: CKQueryWorkspace; executeQuery: () => void };
let outerForm: FormInstance;
const generated = {
  sql: 'SELECT count(*) FROM logs WHERE $__timeFilter(ts)',
  mode: 'timeseries',
  value_key: ['count'],
  label_key: ['host'],
  time_key: 'ts',
};

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range) => range }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { ck: 'ck', doris: 'doris', elasticsearch: 'elasticsearch' } }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer', QUERY_INPUT_MIN_WIDTH: 0 }));
jest.mock('../constants', () => ({
  NAME_SPACE: 'db_ck',
  NG_QUERY_CACHE_KEY: 'query_history',
  NG_QUERY_CACHE_PICK_KEYS: [],
  NG_SQL_CACHE_KEY: 'sql_history',
  isCKDateType: () => false,
}));
jest.mock('../services', () => ({ buildSql: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }), Trans: ({ children }) => children }));
jest.mock('@/components/HistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/HistoricalRecords/ConditionHistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/UsageDocs', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('@/pages/logExplorer/components/SideBar', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('./SideBarNav', () => ({ __esModule: true, default: () => null }));
jest.mock('./utils/organizeFieldsLocalstorage', () => ({ getOrganizeFieldsFromLocalstorage: () => [], setOrganizeFieldsToLocalstorage: jest.fn() }));
jest.mock('./Main', () => ({
  __esModule: true,
  default: (props) => {
    main = props;
    return (
      <>
        {['syntax', 'database', 'table', 'time_field', 'sql', 'query', 'range', 'sqlVizType', 'keys'].map((key) => (
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
        datasourceCate: 'ck',
        query: { syntax: 'sql', database: 'db', table: 'logs', time_field: 'ts', range: { start: 1000000, end: 2000000 }, sql: 'SELECT original WHERE $__timeFilter(ts)' },
      }}
    >
      <Form.Item name='datasourceValue' hidden>
        <Input />
      </Form.Item>
      <Form.Item name='datasourceCate' hidden>
        <Input />
      </Form.Item>
      <CKExplorer tabKey='test' renderCommonSettings={() => null} />
    </Form>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (buildSql as jest.Mock).mockResolvedValue(generated);
});

it('maps CK generation without executing and applies the statement with its keys', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  await act(async () => {
    await main.workspace.convert();
  });
  expect(buildSql).toHaveBeenCalledWith(
    expect.objectContaining({
      cate: 'ck',
      datasource_id: 7,
      query: [expect.objectContaining({ database: 'db', table: 'logs', time_field: 'ts', from: 1000, to: 2000, mode: 'table', limit: undefined })],
    }),
  );
  expect(outerForm.getFieldValue(['query', 'sql'])).toBe(generated.sql);
  expect(outerForm.getFieldValue(['query', 'sqlVizType'])).toBe('timeseries');
  expect(outerForm.getFieldValue(['query', 'keys'])).toEqual({ valueKey: ['count'], labelKey: ['host'], timeKey: 'ts' });
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
  act(() => {
    main.workspace.builderForm.setFieldsValue({ group_by: ['host'], limit: 10 });
    main.workspace.markDirty();
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalledWith('sql_history-7', generated.sql));
  expect(buildSql).toHaveBeenLastCalledWith(expect.objectContaining({ query: [expect.objectContaining({ group_by: ['host'], limit: 10 })] }));
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

  // Staying in the same view keeps the flag (and the results it already produced).
  act(() => outerForm.setFieldsValue({ refreshFlag: 'refreshFlag_previous' }));
  await act(async () => {
    await main.workspace.convert();
  });
  expect(outerForm.getFieldValue('refreshFlag')).toBe('refreshFlag_previous');
});

it('keeps the auxiliary draft when toggling and resets only the current mode', async () => {
  render(<Host />);
  act(() => {
    main.workspace.setAssistEnabled(true);
    main.workspace.builderForm.setFieldsValue({ limit: 33 });
  });
  act(() => main.workspace.enterManual());
  act(() => main.workspace.setAssistEnabled(true));
  expect(main.workspace.builderForm.getFieldValue('limit')).toBe(33);
  act(() => main.workspace.reset());
  expect(main.workspace.builderForm.getFieldValue('limit')).toBeUndefined();
  expect(outerForm.getFieldValue(['query', 'sql'])).toContain('original');
  act(() => {
    main.workspace.enterManual();
    main.workspace.reset();
  });
  expect(outerForm.getFieldValue(['query', 'sql'])).toBe('');
  expect(outerForm.getFieldValue(['query', 'table'])).toBe('logs');
  expect(outerForm.getFieldValue(['query', 'range'])).toEqual({ start: 1000000, end: 2000000 });
});

it('preserves time-macro validation for manual queries', async () => {
  render(<Host />);
  act(() => {
    outerForm.setFieldsValue({ query: { sql: 'SELECT * FROM logs' } });
    main.executeQuery();
  });
  await waitFor(() => expect(document.body).toHaveTextContent('query.warn_message'));
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
  expect(buildSql).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'query.warn_message_btn_1' }));
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalledWith('sql_history-7', 'SELECT * FROM logs'));
});

it('keeps the Query-mode execution and history separate from SQL assistance', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  act(() => {
    outerForm.setFieldsValue({ query: { syntax: 'query', query_builder_filter: [] } });
    main.executeQuery();
  });
  await waitFor(() => expect(setConditionHistory).toHaveBeenCalled());
  expect(buildSql).not.toHaveBeenCalled();
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
  expect(main.workspace.assistEnabled).toBe(false);
});

it('reports missing table configuration without changing or executing the current SQL', async () => {
  render(<Host />);
  act(() => {
    outerForm.setFieldsValue({ query: { table: undefined } });
    main.workspace.setAssistEnabled(true);
  });
  await act(async () => {
    await main.workspace.run();
  });
  expect(main.workspace.error).toEqual(new Error('query.table_msg'));
  expect(outerForm.getFieldValue(['query', 'sql'])).toContain('original');
  expect(buildSql).not.toHaveBeenCalled();
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
});
