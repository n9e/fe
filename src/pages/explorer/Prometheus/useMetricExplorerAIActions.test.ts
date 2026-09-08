/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import type { ActionRunContext, UIAction } from '@flashcatcloud/ai-kit/actions';

import { useMetricExplorerAIActions, MetricExplorerAIActionsOptions } from './useMetricExplorerAIActions';

/**
 * The registry is faked rather than imported, because ai-kit ships ESM that
 * this project's jest transform does not cover. Its schema validation and its
 * unsupported/timeout handling are the package's own contract and are tested
 * there; what is worth pinning here is only what this hook decides — when it
 * registers at all, and what it does to the page when the action runs.
 */
const registered = new Map<string, UIAction<any>>();
const register = jest.fn((actions: UIAction<any>[]) => {
  actions.forEach((action) => registered.set(action.name, action));
  return () => actions.forEach((action) => registered.delete(action.name));
});

jest.mock('@/components/AiChatNG/uiActionRuntime', () => ({
  uiActionRuntime: {
    register: (actions: UIAction<any>[], page: unknown) => register(actions, page),
  },
}));

const ACTION = 'set_metric_query';

function control() {
  return {
    fill: jest.fn(),
    run: jest.fn(),
    queryInput: () => document.createElement('div'),
    queryButton: () => document.createElement('button'),
  };
}

function options(overrides: Partial<MetricExplorerAIActionsOptions> = {}): MetricExplorerAIActionsOptions {
  const box = control();
  return {
    enabled: true,
    datasourceValue: 18001,
    setTimeRange: jest.fn(),
    getControl: () => box,
    ...overrides,
  };
}

function runContext(): ActionRunContext {
  return {
    callId: 'call-1',
    signal: new AbortController().signal,
    feedback: {
      reveal: jest.fn().mockResolvedValue(undefined),
      highlight: jest.fn(),
      moveCursor: jest.fn().mockResolvedValue(undefined),
      click: jest.fn().mockResolvedValue(undefined),
      setControlledRegion: jest.fn(),
      clear: jest.fn(),
    },
  };
}

function run(args: Record<string, unknown>) {
  const action = registered.get(ACTION);
  if (!action) throw new Error(`${ACTION} is not registered`);
  return action.run(args as never, runContext());
}

beforeEach(() => {
  registered.clear();
  register.mockClear();
});

describe('useMetricExplorerAIActions', () => {
  it('registers while the panel owns the conversation and drops it on unmount', () => {
    const { unmount } = renderHook(() => useMetricExplorerAIActions(options()));
    expect(registered.has(ACTION)).toBe(true);
    unmount();
    expect(registered.has(ACTION)).toBe(false);
  });

  it('registers nothing for a panel that does not own the conversation', () => {
    renderHook(() => useMetricExplorerAIActions(options({ enabled: false })));
    expect(register).not.toHaveBeenCalled();
    expect(registered.has(ACTION)).toBe(false);
  });

  it('follows the conversation when it moves to this panel', () => {
    const { rerender, unmount } = renderHook((props: MetricExplorerAIActionsOptions) => useMetricExplorerAIActions(props), {
      initialProps: options({ enabled: false }),
    });
    expect(registered.has(ACTION)).toBe(false);
    rerender(options({ enabled: true }));
    expect(registered.has(ACTION)).toBe(true);
    unmount();
  });

  it('does not re-register when only the query or the data source changes', () => {
    const { rerender, unmount } = renderHook((props: MetricExplorerAIActionsOptions) => useMetricExplorerAIActions(props), {
      initialProps: options(),
    });
    expect(register).toHaveBeenCalledTimes(1);
    rerender(options({ datasourceValue: 999 }));
    expect(register).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('writes the expression into the box, then presses 查询, and leaves the time range alone', async () => {
    const box = control();
    const setTimeRange = jest.fn();
    renderHook(() => useMetricExplorerAIActions(options({ getControl: () => box, setTimeRange })));

    const result = (await run({ promql: '  cpu_usage_active  ' })) as { promql: string };

    // Trimmed: a leading space in the box is something the user has to clean up.
    expect(box.fill).toHaveBeenCalledWith('cpu_usage_active');
    expect(box.run).toHaveBeenCalledTimes(1);
    expect(box.fill.mock.invocationCallOrder[0]).toBeLessThan(box.run.mock.invocationCallOrder[0]);
    expect(result.promql).toBe('cpu_usage_active');
    // Not asked for, so the panel keeps the window the user was reading.
    expect(setTimeRange).not.toHaveBeenCalled();
  });

  it('reads the live data source rather than the one captured at registration', async () => {
    const { rerender } = renderHook((props: MetricExplorerAIActionsOptions) => useMetricExplorerAIActions(props), {
      initialProps: options({ datasourceValue: 1 }),
    });
    rerender(options({ datasourceValue: 2 }));

    const result = (await run({ promql: 'up' })) as { datasource_id: number };

    expect(result.datasource_id).toBe(2);
  });

  it('moves the time range when one is asked for', async () => {
    const setTimeRange = jest.fn();
    renderHook(() => useMetricExplorerAIActions(options({ setTimeRange })));

    await run({ promql: 'up', time_range: { start: 'now-6h', end: 'now' } });

    expect(setTimeRange).toHaveBeenCalledWith({ start: 'now-6h', end: 'now' });
  });

  it('treats an explicit null window as no window', async () => {
    const setTimeRange = jest.fn();
    renderHook(() => useMetricExplorerAIActions(options({ setTimeRange })));

    // The runtime's validator lets null through where it would reject a
    // half-filled object, so this is the one malformed window run() still sees.
    await run({ promql: 'up', time_range: null });

    expect(setTimeRange).not.toHaveBeenCalled();
  });

  it('shows the two gestures on the panel that owns the action: light the box, press its button', async () => {
    const input = document.createElement('div');
    const button = document.createElement('button');
    const box = { ...control(), queryInput: () => input, queryButton: () => button };
    const context = runContext();
    renderHook(() => useMetricExplorerAIActions(options({ getControl: () => box })));

    const action = registered.get(ACTION)!;
    await action.run({ promql: 'up' } as never, context);

    expect(context.feedback.moveCursor).toHaveBeenCalledWith(input);
    expect(context.feedback.highlight).toHaveBeenCalledWith(input);
    expect(context.feedback.click).toHaveBeenCalledWith(button);
    // The press is shown before the query runs, never after.
    expect((context.feedback.click as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(box.run.mock.invocationCallOrder[0]);
  });

  it('refuses to act when the query box is not on screen', async () => {
    renderHook(() => useMetricExplorerAIActions(options({ getControl: () => null })));
    await expect(run({ promql: 'up' })).rejects.toThrow(/not on screen/);
  });

  it('refuses a blank expression instead of clearing the box', async () => {
    const box = control();
    renderHook(() => useMetricExplorerAIActions(options({ getControl: () => box })));

    await expect(run({ promql: '   ' })).rejects.toThrow();
    expect(box.fill).not.toHaveBeenCalled();
    expect(box.run).not.toHaveBeenCalled();
  });
});
