/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';

import request from '@/utils/request';
import SQLBuilderLimit from './index';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'zh_CN' } }) }));

let form: FormInstance;

function Host({ type = 'doris', datasourceId = 7, visible = true }: { type?: string; datasourceId?: number; visible?: boolean }) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <Form form={form} component='div'>
      <SQLBuilderLimit datasourceId={datasourceId} type={type} label='数量限制' visible={visible} />
    </Form>
  );
}

beforeEach(() => jest.clearAllMocks());

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
    await expect(form.validateFields()).resolves.toEqual({ limit: 30 });
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
    await expect(form.validateFields()).resolves.toEqual({ limit: 31 });
  });
  expect(form.getFieldError('limit')).toEqual([]);
  jest.mocked(request).mockResolvedValue({ data: { settings: { 'doris.max_query_rows': 30 } } });
  act(() => form.setFieldsValue({ limit: 30 }));
  await act(async () => {
    await expect(form.validateFields()).resolves.toEqual({ limit: 30 });
  });
  expect(request).toHaveBeenCalledTimes(3);
});
