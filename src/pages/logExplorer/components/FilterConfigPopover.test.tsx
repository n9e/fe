/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DorisPopover from '@/plugins/doris/ExplorerNG/components/QueryBuilder/Filters/FilterConfigPopover';
import CKPopover from '@/plugins/clickHouse/ExplorerNG/components/QueryBuilder/Filters/FilterConfigPopover';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('ahooks', () => ({ useRequest: () => ({ data: [] }) }));
jest.mock('@/utils/constant', () => ({ SIZE: 8, DatasourceCateEnum: { doris: 'doris', ck: 'ck' } }));
jest.mock('@/plugins/doris/services', () => ({ getFiledSample: jest.fn() }));
jest.mock('@/plugins/clickHouse/services', () => ({ getFiledSample: jest.fn() }));

const params = { database: 'db', table: 'logs' } as any;
const fields = [{ field: 'service_name', type: 'string', normalized_type: 'string', indexable: true }];
const confirm = () => fireEvent.click(screen.getByRole('button', { name: 'log_explorer:filter_editor.confirm' }));
const valueInput = () =>
  waitFor(() => {
    const input = document.querySelector<HTMLInputElement>('input#value');
    expect(input).not.toBeNull();
    return input!;
  });
const open = () => fireEvent.click(screen.getByRole('button', { name: 'edit filter' }));

for (const [name, Popover] of [
  ['Doris', DorisPopover],
  ['ClickHouse', CKPopover],
] as const) {
  describe(name, () => {
    it('keeps drafts until confirmation, preserves LIKE normalization and commits disabled explicitly', async () => {
      const onChange = jest.fn();
      const original = { field: 'service_name', operator: 'LIKE', value: 'old', disabled: false };
      render(
        <Popover
          indexData={fields.map((field) => ({ ...field, normalized_type: name === 'Doris' ? 'STRING' : 'text' }))}
          fieldSampleParams={params}
          data={original}
          onChange={onChange}
        >
          <button>edit filter</button>
        </Popover>,
      );
      open();
      const value = await valueInput();
      fireEvent.change(value, { target: { value: 'payment' } });
      fireEvent.click(screen.getByLabelText('log_explorer:filter_editor.disabled_tip'));
      expect(screen.getByRole('checkbox', { name: 'builder.filters.disabled' })).not.toBeChecked();
      fireEvent.click(screen.getByRole('checkbox', { name: 'builder.filters.disabled' }));
      expect(onChange).not.toHaveBeenCalled();
      expect(original.value).toBe('old');
      expect(screen.getByLabelText('log_explorer:filter_editor.disabled_tip')).toBeInTheDocument();
      confirm();
      await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
      expect(onChange).toHaveBeenCalledWith({ field: 'service_name', operator: 'LIKE', value: '%payment%', disabled: true });
      expect(original).toEqual({ field: 'service_name', operator: 'LIKE', value: 'old', disabled: false });
    });

    it('discards changes on Cancel and outside close, and reopens the saved values', async () => {
      const onChange = jest.fn();
      render(
        <Popover
          indexData={fields.map((field) => ({ ...field, normalized_type: name === 'Doris' ? 'STRING' : 'text' }))}
          fieldSampleParams={params}
          data={{ field: 'service_name', operator: '=', value: 'saved' }}
          onChange={onChange}
        >
          <button>edit filter</button>
        </Popover>,
      );
      open();
      fireEvent.change(await valueInput(), { target: { value: 'draft' } });
      fireEvent.click(screen.getByRole('button', { name: 'log_explorer:filter_editor.cancel' }));
      open();
      expect(await valueInput()).toHaveValue('saved');
      fireEvent.change(document.querySelector('input#value')!, { target: { value: 'outside draft' } });
      fireEvent.mouseDown(document.body);
      fireEvent.click(document.body);
      await waitFor(() => expect(document.querySelector('.ant-popover')).toHaveClass('ant-popover-hidden'));
      open();
      expect(await valueInput()).toHaveValue('saved');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('validates required values and adds only on confirmation', async () => {
      const onAdd = jest.fn();
      render(
        <Popover indexData={fields.map((field) => ({ ...field, normalized_type: name === 'Doris' ? 'STRING' : 'text' }))} fieldSampleParams={params} onAdd={onAdd}>
          <button>edit filter</button>
        </Popover>,
      );
      open();
      confirm();
      await waitFor(() => expect(document.querySelector('.ant-form-item-has-error')).toBeInTheDocument());
      expect(onAdd).not.toHaveBeenCalled();
      fireEvent.mouseDown(screen.getByLabelText('builder.filters.field'));
      fireEvent.click(await screen.findByText('service_name', { selector: '.ant-select-item-option-content' }));
      fireEvent.change(await valueInput(), { target: { value: 'payment' } });
      expect(onAdd).not.toHaveBeenCalled();
      confirm();
      await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
      expect(onAdd).toHaveBeenCalledWith({ field: 'service_name', operator: '=', value: 'payment', disabled: false });
    });
  });
}
