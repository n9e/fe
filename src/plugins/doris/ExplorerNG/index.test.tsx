/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';

import DorisExplorer from './index';
import type { DorisQueryWorkspace } from './useQueryWorkspace';
import { defaultBuilderValues } from './useQueryWorkspace';
import { buildSql } from '../services';
import { setLocalQueryHistory } from '@/components/HistoricalRecords';
import { setLocalQueryHistory as setConditionHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';

let main: { workspace: DorisQueryWorkspace; executeQuery: () => void; onQueryEdit: (sql?: string) => void };
let outerForm: FormInstance;
let aiOptions: { onSqlFill: () => void };
const invalidate = jest.fn();
const edit = jest.fn();
const generated = { sql: 'SELECT count(*) FROM logs WHERE $__timeFilter(ts)', mode: 'timeseries', value_key: ['count'], label_key: ['host'] };

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range) => range }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('../constants', () => ({ NAME_SPACE: 'db_doris', NG_QUERY_CACHE_KEY: 'query_history', NG_QUERY_CACHE_PICK_KEYS: [], NG_SQL_CACHE_KEY: 'sql_history' }));
jest.mock('../services', () => ({ buildSql: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }), Trans: ({ children }) => children }));
jest.mock('@/components/HistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/HistoricalRecords/ConditionHistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/UsageDocs', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('@/pages/logExplorer/components/SideBar', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('./SideBarNav', () => ({ __esModule: true, default: () => null }));
jest.mock('./utils/organizeFieldsLocalstorage', () => ({ getOrganizeFieldsFromLocalstorage: () => [], setOrganizeFieldsToLocalstorage: jest.fn() }));
jest.mock('./aiDock', () => ({
  useDorisAiDock: (options) => {
    aiOptions = options;
    return { invalidate, onQueryEdit: edit };
  },
}));
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
        datasourceCate: 'doris',
        query: { syntax: 'sql', database: 'db', table: 'logs', time_field: 'ts', range: { start: 1000, end: 2000 }, sql: 'SELECT original WHERE $__timeFilter(ts)' },
      }}
    >
      <Form.Item name='datasourceValue' hidden>
        <Input />
      </Form.Item>
      <Form.Item name='datasourceCate' hidden>
        <Input />
      </Form.Item>
      <DorisExplorer tabKey='test' renderCommonSettings={() => null} />
    </Form>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (buildSql as jest.Mock).mockResolvedValue(generated);
});

it('maps Doris generation without executing, then queries the latest form through the existing history pipeline', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  await act(async () => {
    await main.workspace.convert();
  });
  expect(buildSql).toHaveBeenCalledWith(
    expect.objectContaining({
      datasource_id: 7,
      query: [expect.objectContaining({ database: 'db', table: 'logs', time_field: 'ts', from: 1000, to: 2000, mode: 'table', limit: undefined })],
    }),
  );
  expect(outerForm.getFieldValue(['query', 'sqlVizType'])).toBe('timeseries');
  expect(outerForm.getFieldValue(['query', 'keys'])).toEqual({ valueKey: ['count'], labelKey: ['host'] });
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
  act(() => {
    main.workspace.builderForm.setFieldsValue({ group_by: ['host'], limit: 10 });
    main.workspace.markDirty();
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalledWith('sql_history-7', generated.sql));
  expect(buildSql).toHaveBeenLastCalledWith(expect.objectContaining({ query: [expect.objectContaining({ group_by: ['host'], limit: 10 })] }));
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
  expect(outerForm.getFieldValue(['query', 'range'])).toEqual({ start: 1000, end: 2000 });
});

it('uses a changed time range even when the query is triggered in the same event', async () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  act(() => {
    outerForm.setFieldsValue({ query: { range: { start: 3000, end: 4000 } } });
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalled());
  expect(buildSql).toHaveBeenLastCalledWith(expect.objectContaining({ query: [expect.objectContaining({ from: 3000, to: 4000 })] }));
});

it('clears obsolete builder settings after changing the table and queries the new context', async () => {
  render(<Host />);
  act(() => {
    main.workspace.setAssistEnabled(true);
    main.workspace.builderForm.setFieldsValue({ group_by: ['old_column'] });
  });
  act(() => {
    outerForm.setFieldsValue({ query: { table: 'new_logs' } });
    main.executeQuery();
  });
  await waitFor(() => expect(setLocalQueryHistory).toHaveBeenCalled());
  expect(buildSql).toHaveBeenLastCalledWith(expect.objectContaining({ query: [expect.objectContaining({ table: 'new_logs', group_by: [] })] }));
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
    outerForm.setFieldsValue({ query: { syntax: 'query', query: 'level:error' } });
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
  expect(main.workspace.error).toEqual(new Error('database_table_required'));
  expect(outerForm.getFieldValue(['query', 'sql'])).toContain('original');
  expect(buildSql).not.toHaveBeenCalled();
  expect(setLocalQueryHistory).not.toHaveBeenCalled();
});

it('enters manual mode before an AI statement is applied', () => {
  render(<Host />);
  act(() => main.workspace.setAssistEnabled(true));
  act(() => aiOptions.onSqlFill());
  expect(main.workspace.assistEnabled).toBe(false);
});
