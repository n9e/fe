/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

it('never fetches on hover/focus or action clicks; loads and caches details on label click', async () => {
  const view = setup();
  const row = view.container.querySelector('.n9e-log-field-row')!;
  fireEvent.mouseEnter(row);
  fireEvent.focus(screen.getByRole('button', { name: 'field_list.add_field' }));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
  expect(view.fetchStats).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'field_list.add_field' }));
  expect(view.onOperClick).toHaveBeenCalledTimes(1);
  expect(view.fetchStats).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('severity'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeEnabled());
  expect(view.fetchStats).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'stack' }));
  expect(view.action).toHaveBeenCalledTimes(1);
  fireEvent.mouseLeave(row);
  fireEvent.mouseEnter(row);
  expect(view.fetchStats).toHaveBeenCalledTimes(1);
});

it('ignores detailed statistics from a previous query', async () => {
  let resolveOld!: (value: typeof result) => void;
  const oldRequest = jest.fn(
    () =>
      new Promise<typeof result>((resolve) => {
        resolveOld = resolve;
      }),
  );
  const view = setup(oldRequest);
  fireEvent.click(screen.getByTitle('severity'));
  await waitFor(() => expect(oldRequest).toHaveBeenCalledTimes(1));
  const newRequest = jest.fn().mockResolvedValue(result);
  view.rerender(<FieldsItem {...view.props} fetchStats={newRequest} />);
  await act(async () => {
    resolveOld(result);
  });
  expect(screen.getByRole('button', { name: 'stack' })).toBeDisabled();
  expect(newRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('severity'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'stack' })).toBeEnabled());
  expect(newRequest).toHaveBeenCalledTimes(1);
});

it('retries a failed details request when the label is reopened', async () => {
  const fetchStats = jest.fn().mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce(result);
  setup(fetchStats);
  fireEvent.click(screen.getByTitle('severity'));
  await waitFor(() => expect(fetchStats).toHaveBeenCalledTimes(1));
  // Wait for the failure to clear the pending request before reopening.
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(screen.getByTitle('severity'));
  fireEvent.click(screen.getByTitle('severity'));
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

it('retains its resize observer across renders and measures changed pressed actions', async () => {
  const original = global.ResizeObserver;
  const disconnect = jest.fn();
  const observe = jest.fn();
  const resize = jest.fn().mockImplementation(() => ({ observe, disconnect }));
  global.ResizeObserver = resize;
  const bounds = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 60, right: 100, width: 72 } as DOMRect);
  try {
    const view = setup();
    const row = view.container.querySelector<HTMLElement>('.n9e-log-field-row')!;
    expect(row.style.getPropertyValue('--log-field-active-width')).toBe('0px');
    view.rerender(<FieldsItem {...view.props} renderStatsPopoverTitleExtra={() => <button aria-pressed='true'>stack</button>} />);
    await waitFor(() => expect(row.style.getPropertyValue('--log-field-active-width')).toBe('48px'));
    expect(resize).toHaveBeenCalledTimes(1);
    expect(disconnect).not.toHaveBeenCalled();
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    bounds.mockRestore();
    global.ResizeObserver = original;
  }
});
