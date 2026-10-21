/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FiltersBuilder from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('ahooks', () => ({ useRequest: () => ({ data: [] }) }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: jest.fn() }));
jest.mock('@/utils/constant', () => ({ SIZE: 8 }));
jest.mock('../../../services', () => ({ getESVersion: jest.fn(), getFieldTopTerms: jest.fn() }));
jest.mock('../../../utils/dslBuilder', () => jest.fn());

function setup(filters: any[] = []) {
  const onChange = jest.fn();
  const executeQuery = jest.fn();
  render(
    <Form>
      <FiltersBuilder indexData={[{ field: 'service', type: 'keyword', indexable: true }]} filters={filters} onChange={onChange} executeQuery={executeQuery} />
    </Form>,
  );
  return { onChange, executeQuery };
}
const open = () => fireEvent.click(screen.getByText('service: saved'));
const input = () => document.querySelector<HTMLInputElement>('input#value')!;
const confirm = () => fireEvent.click(screen.getByRole('button', { name: 'log_explorer:filter_editor.confirm' }));

it('ES/OpenSearch commit only valid confirmed drafts and retain the disable meaning', async () => {
  const original = { key: 'service', operator: 'AND', value: 'saved' };
  const { onChange, executeQuery } = setup([original]);
  open();
  fireEvent.change(input(), { target: { value: 'payment' } });
  fireEvent.click(screen.getByLabelText('log_explorer:filter_editor.disabled_tip'));
  expect(screen.getByRole('checkbox', { name: 'builder.filters.disabled' })).not.toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'builder.filters.disabled' }));
  expect(onChange).not.toHaveBeenCalled();
  confirm();
  await waitFor(() => expect(onChange).toHaveBeenCalledWith([{ key: 'service', operator: 'AND', value: 'payment', disabled: true }]));
  expect(executeQuery).toHaveBeenCalledTimes(1);
  expect(original.value).toBe('saved');
});

it('Cancel and outside close discard drafts, reopening restores the saved filter', async () => {
  const { onChange, executeQuery } = setup([{ key: 'service', operator: 'AND', value: 'saved' }]);
  open();
  fireEvent.change(input(), { target: { value: 'cancelled' } });
  fireEvent.click(screen.getByRole('button', { name: 'log_explorer:filter_editor.cancel' }));
  open();
  expect(input()).toHaveValue('saved');
  fireEvent.change(input(), { target: { value: 'outside' } });
  fireEvent.mouseDown(document.body);
  fireEvent.click(document.body);
  await waitFor(() => expect(document.querySelector('.ant-popover')).toHaveClass('ant-popover-hidden'));
  open();
  expect(input()).toHaveValue('saved');
  expect(onChange).not.toHaveBeenCalled();
  expect(executeQuery).not.toHaveBeenCalled();
});

it('invalid confirmation stays open; adding an exists filter does not require a value', async () => {
  const { onChange } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'plus builder.filters.add' }));
  confirm();
  await waitFor(() => expect(document.querySelector('.ant-form-item-has-error')).toBeInTheDocument());
  expect(onChange).not.toHaveBeenCalled();
  expect(document.querySelector('.ant-popover')).not.toHaveClass('ant-popover-hidden');
  fireEvent.mouseDown(screen.getByLabelText('builder.filters.field'));
  fireEvent.click(await screen.findByText('service', { selector: '.ant-select-item-option-content' }));
  fireEvent.mouseDown(screen.getByLabelText('builder.filters.operator'));
  fireEvent.click(await screen.findByText('exists', { selector: '.ant-select-item-option-content' }));
  confirm();
  await waitFor(() => expect(onChange).toHaveBeenCalledWith([{ key: 'service', operator: 'EXISTS', value: '', disabled: false }]));
});
