/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';

import request from '@/utils/request';
import SQLBuilderLimit from './index';
import resources from '../../locale';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));

const i18n = createInstance();
i18n.init({
  lng: 'zh_CN',
  initImmediate: false,
  resources: Object.fromEntries(Object.entries(resources.log_explorer).map(([language, messages]) => [language, { log_explorer: messages }])),
});

let form: FormInstance;

function Host({
  type = 'doris',
  datasourceId = 7,
  visible = true,
  mode = 'table',
  aggregates = [],
  groupBy = [],
}: {
  type?: string;
  datasourceId?: number;
  visible?: boolean;
  mode?: 'table' | 'timeseries';
  aggregates?: { func: string; field?: string; n?: number }[];
  groupBy?: string[];
}) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <I18nextProvider i18n={i18n}>
      <Form form={form} component='div' initialValues={{ mode, aggregates, group_by: groupBy }}>
        <Form.Item name='mode' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='aggregates' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='group_by' hidden>
          <Input />
        </Form.Item>
        <SQLBuilderLimit datasourceId={datasourceId} type={type} label='数量限制' visible={visible} />
      </Form>
    </I18nextProvider>
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  jest.mocked(request).mockResolvedValue({ data: { settings: {} } });
  await i18n.changeLanguage('zh_CN');
});

it.each([
  { type: 'doris', groupBy: [], aggregates: [], placeholder: '默认 10 条' },
  { type: 'ck', groupBy: [], aggregates: [], placeholder: '默认 10 条' },
  { type: 'elasticsearch', groupBy: [], aggregates: [], placeholder: '默认 100 条' },
  { type: 'doris', groupBy: ['host'], aggregates: [], placeholder: '无限制' },
  { type: 'ck', groupBy: ['host'], aggregates: [], placeholder: '默认 1000 个分组' },
  { type: 'elasticsearch', groupBy: ['host'], aggregates: [], placeholder: '默认 1000 个分组' },
  ...['doris', 'ck', 'elasticsearch'].flatMap((type) => [[], ['host']].map((groupBy) => ({ type, groupBy, aggregates: [{ func: 'COUNT', field: '*' }], placeholder: '无限制' }))),
])('shows the backend default for $type with $groupBy and $aggregates', ({ type, aggregates, groupBy, placeholder }) => {
  render(<Host type={type} aggregates={aggregates} groupBy={groupBy} />);
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', placeholder);
  expect(form.getFieldValue('limit')).toBeUndefined();
});

it('updates the hint as datasource, grouping and aggregates change without writing a limit', () => {
  const view = render(<Host />);
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '默认 10 条');
  act(() => form.setFieldsValue({ group_by: ['host'] }));
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '无限制');
  view.rerender(<Host type='ck' />);
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '默认 1000 个分组');
  act(() => form.setFieldsValue({ aggregates: [{ func: 'SUM', field: 'bytes' }] }));
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '无限制');
  expect(form.getFieldValue('limit')).toBeUndefined();
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
  act(() => form.setFieldsValue({ aggregates: [] }));
  view.rerender(<Host type='elasticsearch' />);
  expect(form.getFieldValue('limit')).toBe(20);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '默认 1000 个分组');
  expect(form.getFieldValue('limit')).toBeNull();
  act(() => form.setFieldsValue({ group_by: [] }));
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', '默认 100 条');
  expect(form.getFieldValue('limit')).toBeNull();
});

it.each([
  { type: 'doris', rowsPlaceholder: '默认 10 条', groupsPlaceholder: '无限制' },
  { type: 'ck', rowsPlaceholder: '默认 10 条', groupsPlaceholder: '默认 1000 个分组' },
  { type: 'elasticsearch', rowsPlaceholder: '默认 100 条', groupsPlaceholder: '默认 1000 个分组' },
])('shows unlimited outside table mode for $type and restores table hints without changing the limit', ({ type, rowsPlaceholder, groupsPlaceholder }) => {
  render(<Host type={type} />);
  const input = screen.getByRole('spinbutton');
  expect(input).toHaveAttribute('placeholder', rowsPlaceholder);
  fireEvent.change(input, { target: { value: '20' } });
  act(() => form.setFieldsValue({ mode: 'timeseries' }));
  expect(input).toHaveAttribute('placeholder', '无限制');
  expect(form.getFieldValue('limit')).toBe(20);
  act(() => form.setFieldsValue({ group_by: ['host'] }));
  expect(input).toHaveAttribute('placeholder', '无限制');
  fireEvent.change(input, { target: { value: '' } });
  expect(input).toHaveAttribute('placeholder', '无限制');
  act(() => form.setFieldsValue({ mode: 'table' }));
  expect(input).toHaveAttribute('placeholder', groupsPlaceholder);
  act(() => form.setFieldsValue({ group_by: [] }));
  expect(input).toHaveAttribute('placeholder', rowsPlaceholder);
  expect(form.getFieldValue('limit')).toBeNull();
});

it('localizes the default hint when the language changes', async () => {
  render(<Host type='ck' groupBy={['host']} />);
  await act(async () => {
    await i18n.changeLanguage('en_US');
  });
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', 'Default: 1000 groups');
  await act(async () => {
    await i18n.changeLanguage('id_ID');
  });
  expect(screen.getByRole('spinbutton')).toHaveAttribute('placeholder', 'Bawaan: 1000 grup');
});

it.each(['doris', 'ck', 'elasticsearch'])('reads %s.max_query_rows from the detail API and reuses the request during validation', async (type) => {
  jest.mocked(request).mockResolvedValue({ data: { settings: { [`${type}.max_query_rows`]: 30, 'other.max_query_rows': 999 } } });
  render(<Host type={type} />);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '31' } });
  await act(async () => {
    await expect(form.validateFields()).rejects.toMatchObject({ errorFields: [expect.objectContaining({ name: ['limit'] })] });
  });
  await waitFor(() => expect(screen.getByText('数量限制最大值为30')).toBeVisible());
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '30' } });
  await act(async () => {
    await expect(form.validateFields()).resolves.toMatchObject({ limit: 30 });
  });
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith('/api/v1/datasource/desc', { method: 'POST', data: { id: 7 }, silence: true });
});

it('waits for the detail response before allowing validation to finish', async () => {
  let resolveDetail: (value: unknown) => void = () => {};
  jest.mocked(request).mockReturnValue(new Promise((resolve) => (resolveDetail = resolve)));
  render(<Host />);
  act(() => form.setFieldsValue({ limit: 31 }));
  const completed = jest.fn();
  const validation = form.validateFields().then(completed, completed);
  await act(async () => {
    await Promise.resolve();
  });
  expect(completed).not.toHaveBeenCalled();
  await act(async () => {
    resolveDetail({ data: { settings: { 'doris.max_query_rows': 30 } } });
    await validation;
  });
  expect(form.getFieldError('limit')).toEqual(['数量限制最大值为30']);
});

it('uses the new datasource response even if the old request finishes later', async () => {
  let resolveOld: (value: unknown) => void = () => {};
  jest
    .mocked(request)
    .mockImplementation((_, options) =>
      options?.data?.id === 7 ? new Promise((resolve) => (resolveOld = resolve)) : Promise.resolve({ data: { settings: { 'doris.max_query_rows': 30 } } }),
    );
  const view = render(<Host />);
  view.rerender(<Host datasourceId={8} />);
  act(() => form.setFieldsValue({ limit: 31 }));
  await act(async () => {
    resolveOld({ data: { settings: { 'doris.max_query_rows': 999 } } });
    await expect(form.validateFields()).rejects.toBeDefined();
  });
  expect(form.getFieldError('limit')).toEqual(['数量限制最大值为30']);
});

it('fetches only when a modal opens and refreshes the detail when it reopens', async () => {
  jest.mocked(request).mockResolvedValue({ data: { settings: { 'doris.max_query_rows': 30 } } });
  const view = render(<Host visible={false} />);
  expect(request).not.toHaveBeenCalled();
  view.rerender(<Host />);
  expect(request).toHaveBeenCalledTimes(1);
  view.rerender(<Host visible={false} />);
  view.rerender(<Host />);
  expect(request).toHaveBeenCalledTimes(2);
});

it.each([
  { name: 'request failure', error: new Error('Detail unavailable') },
  { name: 'permission denied', error: { status: 403, message: 'Forbidden' } },
])('skips maximum validation on $name and allows a retry', async ({ error }) => {
  jest.mocked(request).mockRejectedValue(error);
  render(<Host />);
  await act(async () => {
    await Promise.resolve();
  });
  act(() => form.setFieldsValue({ limit: 31 }));
  await act(async () => {
    await expect(form.validateFields()).resolves.toMatchObject({ limit: 31 });
  });
  expect(form.getFieldError('limit')).toEqual([]);
  jest.mocked(request).mockResolvedValue({ data: { settings: { 'doris.max_query_rows': 30 } } });
  act(() => form.setFieldsValue({ limit: 30 }));
  await act(async () => {
    await expect(form.validateFields()).resolves.toMatchObject({ limit: 30 });
  });
  expect(request).toHaveBeenCalledTimes(3);
});
