/** @jest-environment jsdom */
import React, { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';

import type AiQueryDock from '@/components/AiQueryDock';
import type { useQueryDockActions } from '@/components/AiQueryDock/useQueryDockActions';
import type LogQL from '@/components/LogQL';
import type Table from './Table';
import Explorer from './index';

type AiQueryDockProps = React.ComponentProps<typeof AiQueryDock>;
type AiActionsOptions = Parameters<typeof useQueryDockActions>[0];
type LogQLProps = React.ComponentProps<typeof LogQL>;
type TableProps = React.ComponentProps<typeof Table>;

const mockMode = { isEnt: false };
jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: { mysql: 'mysql' },
  get IS_ENT() {
    return mockMode.isEnt;
  },
}));
// The box is a plain textarea here: the page only needs "the user typed".
jest.mock('@/components/LogQL', () => ({
  __esModule: true,
  default: (props: LogQLProps) => <textarea aria-label='sql' value={props.value || ''} onChange={(event) => props.onChange?.(event.target.value)} />,
}));
// The table answers every run with three rows, unless a test holds the
// answers back to replay them in its own order.
const mockTable = { rows: 3, hold: false, requests: [] as NonNullable<TableProps['queryRequest']>[] };
jest.mock('./Table', () => ({
  __esModule: true,
  default: (props: TableProps) => {
    useEffect(() => {
      if (!props.refreshFlag || !props.queryRequest) return;
      if (mockTable.hold) mockTable.requests.push(props.queryRequest);
      else props.queryRequest.complete({ empty: mockTable.rows === 0, count: mockTable.rows });
    }, [props.refreshFlag]);
    return <div data-testid='table' />;
  },
}));
jest.mock('./Graph', () => ({ __esModule: true, default: () => <div data-testid='graph' /> }));
jest.mock('../components/Meta', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/HistoricalRecords', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../globalState', () => ({ useGlobalState: () => [[], jest.fn()] }));
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/components/InputGroupWithFormItem', () => ({ __esModule: true, default: (props: { children: React.ReactNode }) => <div>{props.children}</div> }));
jest.mock('@/components/TimeRangePicker', () => ({
  __esModule: true,
  default: () => null,
  timeRangeUnix: (range: { start: string; end: string }) => ({ start: 100, end: 200 }),
}));
jest.mock('@/components/AiChatNG/constants', () => ({ NAME_SPACE: 'ai' }));
let dockProps: AiQueryDockProps | undefined;
jest.mock('@/components/AiQueryDock', () => ({
  __esModule: true,
  default: (props: AiQueryDockProps) => {
    dockProps = props;
    return <div data-testid='ai-dock' data-open={String(props.open)} />;
  },
}));
const mockActions = { options: [] as AiActionsOptions[], invalidateUndo: jest.fn() };
jest.mock('@/components/AiQueryDock/useQueryDockActions', () => ({
  useQueryDockActions: (options: AiActionsOptions) => {
    mockActions.options.push(options);
    return {
      progress: { phase: 'idle' },
      canUndo: false,
      prepareTurn: jest.fn(),
      undo: jest.fn(),
      cancel: jest.fn(),
      invalidateUndo: mockActions.invalidateUndo,
      reset: jest.fn(),
    };
  },
}));

function Host() {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <Explorer datasourceValue={7} />
    </Form>
  );
}
const control = () => mockActions.options[mockActions.options.length - 1].getControl()!;

beforeEach(() => {
  mockActions.options = [];
  mockActions.invalidateUndo.mockClear();
  mockTable.rows = 3;
  mockTable.hold = false;
  mockTable.requests = [];
  dockProps = undefined;
});

describe('open-source and Nightingale commercial builds', () => {
  it('keeps the query row as it was and never mounts the dock', () => {
    mockMode.isEnt = false;
    render(<Host />);
    expect(screen.getByLabelText('sql')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-dock')).toBeNull();
    expect(screen.queryByRole('button', { name: 'dock.open' })).toBeNull();
  });
});

describe('Flashcat enterprise build', () => {
  beforeEach(() => {
    mockMode.isEnt = true;
  });

  it('mounts the dock behind its trigger and names the action for SQL', () => {
    render(<Host />);
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'dock.open' }));
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'true');
    const latest = mockActions.options[mockActions.options.length - 1];
    expect(latest.enabled).toBe(true);
    expect(latest.action).toMatchObject({ name: 'set_sql_query', argument: 'sql' });
    expect(dockProps?.resultNoun).toBe('rows');
  });

  it('writes the statement into the box, runs it in the table view and reports the rows', async () => {
    render(<Host />);
    act(() => control().fill('select 1', { start: 'now-6h', end: 'now' }));
    expect(screen.getByLabelText('sql')).toHaveValue('select 1');
    expect(control().snapshot()).toEqual({ query: 'select 1', range: { start: 'now-6h', end: 'now' } });
    let result!: Promise<{ empty: boolean; count?: number }>;
    act(() => {
      result = control().run();
    });
    await expect(result).resolves.toEqual({ empty: false, count: 3 });
  });

  it('never lets a slow earlier run answer for a later one', async () => {
    render(<Host />);
    mockTable.hold = true;
    act(() => control().fill('select 1'));
    let first!: Promise<unknown>;
    act(() => {
      first = control()
        .run()
        .catch((error: Error) => error.name);
    });
    act(() => control().fill('select 2'));
    let second!: Promise<{ empty: boolean; count?: number }>;
    act(() => {
      second = control().run();
    });
    expect(mockTable.requests).toHaveLength(2);
    // The stale response lands first and reaches nobody.
    act(() => mockTable.requests[0].complete({ empty: true, count: 0 }));
    await expect(first).resolves.toBe('AbortError');
    act(() => mockTable.requests[1].complete({ empty: false, count: 5 }));
    await expect(second).resolves.toEqual({ empty: false, count: 5 });
  });

  it('runs in the table view even when the graph is showing', async () => {
    render(<Host />);
    fireEvent.click(screen.getByRole('tab', { name: 'Graph' }));
    expect(screen.getByTestId('graph')).toBeInTheDocument();
    act(() => control().fill('select 1'));
    let result!: Promise<{ empty: boolean; count?: number }>;
    act(() => {
      result = control().run();
    });
    await expect(result).resolves.toEqual({ empty: false, count: 3 });
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('counts the user typing and switching tabs as taking the panel back', () => {
    render(<Host />);
    const before = control().revision();
    fireEvent.change(screen.getByLabelText('sql'), { target: { value: 'select 2' } });
    expect(control().revision()).toBe(before + 1);
    expect(mockActions.invalidateUndo).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: 'Graph' }));
    expect(control().revision()).toBe(before + 2);
    // The assistant writing is not the user taking over.
    act(() => control().fill('select 3'));
    expect(control().revision()).toBe(before + 2);
  });

  it('puts the previous statement back on restore', () => {
    render(<Host />);
    act(() => control().fill('select 1'));
    const previous = control().snapshot();
    act(() => control().fill('select 2'));
    act(() => control().restore(previous));
    expect(screen.getByLabelText('sql')).toHaveValue('select 1');
  });

  it('sends the data source, the statement and the window with each message', () => {
    render(<Host />);
    act(() => control().fill('select 1'));
    const pageFrom = dockProps!.pageFrom;
    expect(typeof pageFrom).toBe('function');
    expect((pageFrom as () => unknown)()).toMatchObject({ param: { datasource_type: 'mysql', datasource_id: 7, query: 'select 1', start: '100', end: '200' } });
  });
});
