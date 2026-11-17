/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, Form, Input } from 'antd';
import enUS from 'antd/lib/locale/en_US';

import request from '@/utils/request';
import { buildSql } from '../../../services';
import useDorisQueryWorkspace, { DorisQueryWorkspace } from '../../useQueryWorkspace';
import QueryBuilder from './index';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range) => range }));
jest.mock('@/utils/constant', () => ({ SIZE: 8, DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('../../../services', () => ({ buildSql: jest.fn() }));
jest.mock('react-i18next', () => {
  const i18n = require('i18next').createInstance();
  i18n.init({ lng: 'en_US', initImmediate: false, resources: { en_US: { translation: require('../../../locale/en_US').default } } });
  return { useTranslation: () => ({ t: i18n.t.bind(i18n), i18n }) };
});
jest.mock('./utils/getMaxLabelWidth', () => ({ __esModule: true, default: () => 100 }));
jest.mock('./Filters', () => ({ __esModule: true, default: () => null }));
jest.mock('./Aggregates', () => ({ __esModule: true, default: () => null }));
jest.mock('./OrderBy', () => ({ __esModule: true, default: () => null }));

let workspace: DorisQueryWorkspace;
const execute = jest.fn();
const datasourceDetails = {
  7: { 'doris.max_query_rows': 750 },
  8: { 'doris.max_query_rows': 30 },
  9: {},
  10: { 'doris.max_query_rows': 0 },
};

function Host({ datasourceId = 7 }: { datasourceId?: number }) {
  const [form] = Form.useForm();
  workspace = useDorisQueryWorkspace({ form, datasourceValue: datasourceId, execute, onQueryEdit: jest.fn() });
  return (
    <ConfigProvider locale={enUS}>
      <Form form={form} initialValues={{ query: { syntax: 'sql', database: 'db', table: 'logs', time_field: 'ts', range: { start: 1000, end: 2000 } } }}>
        {['syntax', 'database', 'table', 'time_field', 'range'].map((key) => (
          <Form.Item key={key} name={['query', key]} hidden>
            <Input />
          </Form.Item>
        ))}
        <QueryBuilder
          explorerForm={form}
          form={workspace.builderForm}
          datasourceValue={datasourceId}
          database='db'
          table='logs'
          time_field='ts'
          indexData={[]}
          onChange={workspace.markDirty}
        />
      </Form>
    </ConfigProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(request).mockImplementation((_, options) => Promise.resolve({ data: { settings: datasourceDetails[options?.data?.id] } }));
  (buildSql as jest.Mock).mockResolvedValue({ sql: 'SELECT * FROM logs LIMIT 750', mode: 'table', value_key: [], label_key: [] });
});

it('shows an error and blocks conversion and execution when the limit exceeds the configured maximum', async () => {
  render(<Host />);
  expect(request).toHaveBeenCalledWith('/api/v1/datasource/desc', { method: 'POST', data: { id: 7 }, silence: true });
  act(() => workspace.setAssistEnabled(true));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '751' } });
  fireEvent.blur(screen.getByRole('spinbutton'));
  await act(async () => {
    await workspace.convert();
    await workspace.run();
  });
  await waitFor(() => expect(screen.getByText('Limit must be maximum 750')).toBeVisible());
  expect(buildSql).not.toHaveBeenCalled();
  expect(execute).not.toHaveBeenCalled();
});

it.each([1, 749, 750, undefined])('allows limit %s, including the configured maximum and an empty limit', async (limit) => {
  render(<Host />);
  act(() => {
    workspace.setAssistEnabled(true);
    workspace.builderForm.setFieldsValue({ limit });
  });
  await act(async () => {
    await workspace.run();
  });
  expect(buildSql).toHaveBeenCalledWith(expect.objectContaining({ datasource_id: 7, query: [expect.objectContaining({ limit })] }));
  expect(execute).toHaveBeenCalledTimes(1);
});

it('uses the new datasource maximum after switching datasources', async () => {
  const view = render(<Host />);
  view.rerender(<Host datasourceId={8} />);
  act(() => {
    workspace.setAssistEnabled(true);
    workspace.builderForm.setFieldsValue({ limit: 31 });
  });
  await act(async () => {
    await workspace.run();
  });
  expect(buildSql).not.toHaveBeenCalled();
  expect(workspace.builderForm.getFieldError('limit')).toEqual(['Limit must be maximum 30']);
  act(() => workspace.builderForm.setFieldsValue({ limit: 30 }));
  await act(async () => {
    await workspace.run();
  });
  expect(buildSql).toHaveBeenCalledWith(expect.objectContaining({ datasource_id: 8, query: [expect.objectContaining({ limit: 30 })] }));
});

it.each([9, 10])('skips maximum validation for an absent or zero setting (datasource %s)', async (datasourceId) => {
  render(<Host datasourceId={datasourceId} />);
  act(() => {
    workspace.setAssistEnabled(true);
    workspace.builderForm.setFieldsValue({ limit: 501 });
  });
  await act(async () => {
    await workspace.run();
  });
  expect(buildSql).toHaveBeenCalledWith(expect.objectContaining({ datasource_id: datasourceId, query: [expect.objectContaining({ limit: 501 })] }));
  expect(execute).toHaveBeenCalledTimes(1);
});
