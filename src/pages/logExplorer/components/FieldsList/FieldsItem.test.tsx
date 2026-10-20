/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FieldsItem from './FieldsItem';

jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#7755aa', DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const field = { field: 'severity', type: 'string', indexable: true };
const result = { topN: [{ value: 'warning', count: 4, percent: 50 }], stats: { unique_count: 3, min: 0, max: 0, avg: 0, sum: 0 } };
function setup(fetchStats = jest.fn().mockResolvedValue(result)) {
  const onOperClick = jest.fn();
  const action = jest.fn();
  const props = {
    operType: 'available' as const,
    field,
    typeMap: { string: 'string' },
    enableStats: true,
    fetchStats,
    onOperClick,
    renderStatsPopoverTitleExtra: ({ stats, loading }: any) => (
      <button onClick={action} disabled={loading || !stats}>
        stack
      </button>
    ),
  };
  const view = render(<FieldsItem {...props} />);
  return { ...view, props, fetchStats, onOperClick, action };
}

it('loads statistics on hover without opening the popover, caches them, and isolates action clicks', async () => {
  const view = setup();
  expect(view.fetchStats).not.toHaveBeenCalled();
  const row = view.container.querySelector('.n9e-log-field-row')!;
  fireEvent.mouseEnter(row);
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeEnabled());
  expect(view.fetchStats).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.ant-popover')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'stack' }));
  expect(view.action).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.ant-popover')).not.toBeInTheDocument();
  fireEvent.mouseLeave(row);
  fireEvent.mouseEnter(row);
  fireEvent.click(screen.getByRole('button', { name: 'field_list.add_field' }));
  expect(view.onOperClick).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('severity'));
  await waitFor(() => expect(screen.getByText('field_values_topn.title')).toBeInTheDocument());
  expect(view.fetchStats).toHaveBeenCalledTimes(1);
});

it('supports keyboard access and ignores statistics from a previous query', async () => {
  let resolveOld!: (value: typeof result) => void;
  const oldRequest = jest.fn(
    () =>
      new Promise<typeof result>((resolve) => {
        resolveOld = resolve;
      }),
  );
  const view = setup(oldRequest);
  fireEvent.focus(screen.getByRole('button', { name: 'stack' }));
  await waitFor(() => expect(oldRequest).toHaveBeenCalledTimes(1));
  const newRequest = jest.fn().mockResolvedValue(result);
  view.rerender(<FieldsItem {...view.props} fetchStats={newRequest} />);
  resolveOld(result);
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeDisabled());
  fireEvent.focus(screen.getByRole('button', { name: 'stack' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeEnabled());
  expect(newRequest).toHaveBeenCalledTimes(1);
});

it('retries a failed statistics request on the next hover', async () => {
  const fetchStats = jest.fn().mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce(result);
  const view = setup(fetchStats);
  const row = view.container.querySelector('.n9e-log-field-row')!;
  fireEvent.focus(screen.getByRole('button', { name: 'stack' }));
  await waitFor(() => expect(fetchStats).toHaveBeenCalledTimes(1));
  fireEvent.mouseLeave(row);
  fireEvent.mouseEnter(row);
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeEnabled());
  expect(fetchStats).toHaveBeenCalledTimes(2);
});

it('shows field information only over the label, and hides it when entering the action buttons', async () => {
  const view = setup();
  const button = screen.getByRole('button', { name: 'field_list.add_field' });
  fireEvent.mouseEnter(button);
  await waitFor(() => expect(screen.getByText('field_list.add_field')).toBeInTheDocument());
  expect(screen.queryByText('field_tip')).not.toBeInTheDocument();
  fireEvent.mouseLeave(button);
  const label = view.container.querySelector('.n9e-log-field-label')!;
  fireEvent.mouseEnter(label);
  await waitFor(() => expect(screen.getByText('field_tip')).toBeInTheDocument());
  fireEvent.mouseLeave(label);
  fireEvent.mouseEnter(button);
  // AntD retains the popup DOM and hides it via this class (styles are mocked in Jest).
  await waitFor(() => expect(screen.getByText('field_tip').closest('.ant-tooltip')).toHaveClass('ant-tooltip-hidden'));
});
