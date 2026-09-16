/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type AiQueryDock from './index';
import type { QueryDockControl, QueryDockSnapshot, useQueryDockActions } from './useQueryDockActions';
import { useAiQueryDock } from './useAiQueryDock';
import type { AiQueryDockAdapter, AiQueryDockOptions } from './useAiQueryDock';

type AiQueryDockProps = React.ComponentProps<typeof AiQueryDock>;
type AiActionsOptions = Parameters<typeof useQueryDockActions>[0];
type Snapshot = QueryDockSnapshot & { range?: IRawTimeRange };

// Which build we are: the hook reads IS_ENT at render time, so a getter lets
// each test pick the build without reloading the module.
const mockMode = { isEnt: false };
jest.mock('@/utils/constant', () => ({
  get IS_ENT() {
    return mockMode.isEnt;
  },
}));
jest.mock('@/components/AiChatNG/constants', () => ({ NAME_SPACE: 'ai' }));
jest.mock('@/components/TimeRangePicker', () => ({ timeRangeUnix: () => ({ start: 100, end: 200 }) }));
jest.mock('@/components/AiChatNG/recommend', () => ({
  buildPageFrom: (options: { param?: Record<string, unknown> }) => ({ url: '/page', param: options.param }),
}));
let dockProps: AiQueryDockProps | undefined;
jest.mock('./index', () => ({
  __esModule: true,
  default: (props: AiQueryDockProps) => {
    dockProps = props;
    return <div data-testid='ai-dock' data-open={String(props.open)} />;
  },
}));
const mockActions = { options: [] as AiActionsOptions[], cancel: jest.fn() };
jest.mock('./useQueryDockActions', () => ({
  useQueryDockActions: (options: AiActionsOptions) => {
    mockActions.options.push(options);
    return { progress: { phase: 'idle' }, canUndo: false, prepareTurn: jest.fn(), undo: jest.fn(), cancel: mockActions.cancel, invalidateUndo: jest.fn(), reset: jest.fn() };
  },
}));

const adapter: AiQueryDockAdapter = {
  datasourceType: 'prometheus',
  statementParam: 'promql',
  action: { name: 'set_metric_query', argument: 'promql', language: 'PromQL expression', followUpExample: 'by env', page: { title: 'Metric explorer', summary: 'PromQL' } },
  prompts: ['dock.prompt_cpu'],
};
const control: QueryDockControl<Snapshot> = {
  snapshot: () => ({ query: ' up ', range: { start: 'now-1h', end: 'now' } }),
  revision: () => 0,
  fill: jest.fn(),
  run: jest.fn(),
  restore: jest.fn(),
  queryInput: () => null,
  queryButton: () => null,
};

function Host(props: Pick<AiQueryDockOptions<Snapshot>, 'pageParams' | 'onToggle'>) {
  const ai = useAiQueryDock(adapter, { datasourceValue: 7, getControl: () => control, ...props });
  return (
    <div>
      {ai.trigger}
      {ai.dock}
    </div>
  );
}

beforeEach(() => {
  mockActions.options = [];
  mockActions.cancel.mockClear();
  dockProps = undefined;
});

describe('open-source and Nightingale commercial builds', () => {
  it('renders nothing and never lets the assistant write', () => {
    mockMode.isEnt = false;
    render(<Host />);
    expect(screen.queryByRole('button', { name: 'dock.open' })).toBeNull();
    expect(screen.queryByTestId('ai-dock')).toBeNull();
    expect(mockActions.options.map((options) => options.enabled)).not.toContain(true);
  });
});

describe('Flashcat enterprise build', () => {
  beforeEach(() => {
    mockMode.isEnt = true;
  });

  it('opens behind its trigger, and only then lets the assistant write', () => {
    const onToggle = jest.fn();
    render(<Host onToggle={onToggle} />);
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'false');
    expect(mockActions.options.map((options) => options.enabled)).not.toContain(true);

    fireEvent.click(screen.getByRole('button', { name: 'dock.open' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'true');
    expect(mockActions.options[mockActions.options.length - 1]).toMatchObject({ enabled: true, datasourceValue: 7, action: adapter.action });
  });

  it('describes the page when a message is sent, under the adapter statement key and with the page params', () => {
    render(<Host pageParams={() => ({ query_parameters: { table: 'access_log' } })} />);
    const pageFrom = dockProps!.pageFrom as () => unknown;
    expect(pageFrom()).toEqual({
      url: '/page',
      param: { datasource_type: 'prometheus', datasource_id: 7, promql: 'up', start: '100', end: '200', query_parameters: { table: 'access_log' } },
    });
  });

  it('turns the prompt keys into label and question', () => {
    render(<Host />);
    expect(dockProps!.promptList).toEqual([{ label: 'dock.prompt_cpu', value: 'dock.prompt_cpu_query' }]);
  });

  it('stops the running turn when closed', () => {
    render(<Host />);
    fireEvent.click(screen.getByRole('button', { name: 'dock.open' }));
    act(() => dockProps!.onClose());
    expect(mockActions.cancel).toHaveBeenCalled();
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'false');
  });
});
