/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import type { ActionRunContext, UIAction } from '@flashcatcloud/ai-kit/actions';
import { useQueryDockActions, QueryDockActionsOptions, QueryDockAction } from './useQueryDockActions';

const registered = new Map<string, UIAction<any>>();
let feedback: ActionRunContext['feedback'];
let runtimeAbort: AbortController;
let runtimeFailureStatus = 'failed';
jest.mock('@/components/AiChatNG/uiActionRuntime', () => ({
  uiActionRuntime: {
    register: (actions: UIAction<any>[]) => {
      actions.forEach((action) => registered.set(action.name, action));
      return () =>
        actions.forEach((action) => {
          if (registered.get(action.name) === action) registered.delete(action.name);
        });
    },
    execute: async (call) => {
      try {
        const result = await registered.get(call.name)!.run(call.args, { callId: call.callId, signal: runtimeAbort.signal, feedback });
        return { ok: true, status: 'ok', action: call.name, result };
      } catch (error) {
        return { ok: false, status: runtimeFailureStatus, action: call.name, message: String(error) };
      }
    },
  },
}));
const action: QueryDockAction = {
  name: 'set_metric_query',
  argument: 'promql',
  language: 'PromQL expression',
  followUpExample: '改成按 env 分组取平均',
  page: { title: 'Metric explorer', summary: 'One query panel.' },
};
const request = { call_id: 'call-1', name: 'set_metric_query', description: 'Fill and run the query', args: { promql: 'up' } };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function setup() {
  let revision = 0;
  const snapshot = { query: 'draft', submitted: 'previous', range: { start: 'now-1h', end: 'now' }, timestamp: 123 };
  const box = {
    snapshot: () => snapshot,
    revision: () => revision,
    fill: jest.fn(),
    run: jest.fn().mockResolvedValue({ empty: false }),
    restore: jest.fn(),
    queryInput: () => document.createElement('div'),
    queryButton: () => document.createElement('button'),
  };
  const props = { enabled: true, datasourceValue: 1, getControl: () => box, action };
  const view = renderHook((p: QueryDockActionsOptions<typeof snapshot>) => useQueryDockActions(p), { initialProps: props });
  let scope!: ReturnType<typeof view.result.current.prepareTurn>;
  act(() => {
    scope = view.result.current.prepareTurn();
  });
  return {
    ...view,
    props,
    box,
    snapshot,
    scope,
    edit: () => {
      revision++;
    },
  };
}
beforeEach(() => {
  registered.clear();
  runtimeFailureStatus = 'failed';
  runtimeAbort = new AbortController();
  feedback = {
    reveal: jest.fn().mockResolvedValue(undefined),
    highlight: jest.fn(),
    moveCursor: jest.fn().mockResolvedValue(undefined),
    click: jest.fn().mockResolvedValue(undefined),
    setControlledRegion: jest.fn(),
    clear: jest.fn(),
  };
});

it('waits for the actual query result before reporting completion', async () => {
  const { result, scope, box } = setup();
  const pending = deferred<{ empty: boolean }>();
  box.run.mockReturnValue(pending.promise);
  let execution!: ReturnType<typeof scope.executePageAction>;
  await act(async () => {
    execution = scope.executePageAction(request);
  });
  expect(result.current.progress.phase).toBe('querying');
  await act(async () => {
    pending.resolve({ empty: false });
    await execution;
  });
  expect(result.current.progress.phase).toBe('success');
  expect(box.fill).toHaveBeenCalledWith('up', undefined);
});
it('distinguishes empty results and query errors from success', async () => {
  const { result, scope, box } = setup();
  box.run.mockResolvedValue({ empty: true });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(result.current.progress.phase).toBe('empty');
  let next!: typeof scope;
  act(() => {
    next = result.current.prepareTurn();
  });
  box.run.mockRejectedValue(new Error('query unavailable'));
  await act(async () => {
    await next.executePageAction({ ...request, call_id: 'call-2' });
  });
  expect(result.current.progress.phase).toBe('failed');
  expect(result.current.progress.message).toContain('query unavailable');
});
it("passes the model's follow-up hint along with a delivered result", async () => {
  const { result, scope, box } = setup();
  box.run.mockResolvedValue({ empty: false, count: 8 });
  await act(async () => {
    await scope.executePageAction({ ...request, args: { promql: 'up', follow_up: ' 改成按 env 分组取平均 ' } });
  });
  expect(result.current.progress).toEqual({ phase: 'success', stage: 'queried', count: 8, followUp: '改成按 env 分组取平均' });
});
it('resets the status for a new conversation but keeps undo for what was written', async () => {
  const { result, scope, box } = setup();
  box.run.mockResolvedValue({ empty: false });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(result.current.canUndo).toBe(true);
  act(() => result.current.reset());
  expect(result.current.progress).toEqual({ phase: 'idle' });
  expect(result.current.canUndo).toBe(true);
});
it('preserves a late answer as unapplied when the user edits the draft', async () => {
  const { result, scope, box, edit } = setup();
  edit();
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(box.fill).not.toHaveBeenCalled();
  expect(result.current.progress.phase).toBe('changed');
});
it('does not apply an old answer to a newly selected data source', async () => {
  const { scope, box, rerender, props, result } = setup();
  rerender({ ...props, datasourceValue: 2 });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(box.fill).not.toHaveBeenCalled();
  expect(result.current.progress.phase).toBe('changed');
});
it('checks context again after the cursor moves', async () => {
  const { scope, box, edit, result } = setup();
  (feedback.moveCursor as jest.Mock).mockImplementation(async () => {
    edit();
  });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(box.fill).not.toHaveBeenCalled();
  expect(result.current.progress.phase).toBe('changed');
});
it('stopping before fill prevents every mutation', async () => {
  const { scope, box, result } = setup();
  (feedback.moveCursor as jest.Mock).mockImplementation(async () => {
    runtimeAbort.abort();
  });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(box.fill).not.toHaveBeenCalled();
  expect(box.run).not.toHaveBeenCalled();
  expect(result.current.progress).toMatchObject({ phase: 'stopped', stage: 'unchanged' });
});
it('stopping after fill prevents the query and keeps undo available', async () => {
  const { scope, box, result, snapshot } = setup();
  (feedback.click as jest.Mock).mockImplementation(async () => {
    scope.cancel();
  });
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(box.fill).toHaveBeenCalled();
  expect(box.run).not.toHaveBeenCalled();
  expect(result.current.progress).toMatchObject({ phase: 'stopped', stage: 'filled' });
  act(() => result.current.undo());
  expect(box.restore).toHaveBeenCalledWith(snapshot);
});
it('restores the expression and time snapshot from immediately before the latest action', async () => {
  const { scope, result, box, snapshot } = setup();
  await act(async () => {
    await scope.executePageAction({ ...request, args: { promql: 'up', time_range: { start: 'now-6h', end: 'now' } } });
  });
  expect(box.fill).toHaveBeenCalledWith('up', { start: 'now-6h', end: 'now' });
  expect(result.current.canUndo).toBe(true);
  act(() => result.current.undo());
  expect(box.restore).toHaveBeenCalledWith(snapshot);
  expect(result.current.canUndo).toBe(false);
  expect(result.current.progress.phase).toBe('undone');
});
it('closing or unmounting cancels an in-flight action before it can fill', async () => {
  const { scope, box, rerender, props } = setup();
  const move = deferred<void>();
  (feedback.moveCursor as jest.Mock).mockReturnValue(move.promise);
  let execution!: ReturnType<typeof scope.executePageAction>;
  await act(async () => {
    execution = scope.executePageAction(request);
  });
  rerender({ ...props, enabled: false });
  await act(async () => {
    move.resolve();
    await execution;
  });
  expect(box.fill).not.toHaveBeenCalled();
});
it('refuses blank expressions without losing the original draft', async () => {
  const { scope, box } = setup();
  await act(async () => {
    await scope.executePageAction({ ...request, args: { promql: '  ' } });
  });
  expect(box.fill).not.toHaveBeenCalled();
});

it('reports a runtime timeout as a query failure rather than a user stop', async () => {
  const { scope, result } = setup();
  runtimeFailureStatus = 'timeout';
  (feedback.moveCursor as jest.Mock).mockImplementation(async () => {
    runtimeAbort.abort();
  });
  let outcome;
  await act(async () => {
    outcome = await scope.executePageAction(request);
  });
  expect(outcome.status).toBe('timeout');
  expect(result.current.progress).toMatchObject({ phase: 'failed', message: 'dock.timeout' });
});
it('removes undo when the user changes query context', async () => {
  const { scope, result } = setup();
  await act(async () => {
    await scope.executePageAction(request);
  });
  expect(result.current.canUndo).toBe(true);
  act(() => result.current.invalidateUndo());
  expect(result.current.canUndo).toBe(false);
});
it('declares the tool and reads the statement under the names the action gives', async () => {
  const sql: QueryDockAction = { ...action, name: 'set_sql_query', argument: 'sql', language: 'SQL statement' };
  const { result, box, rerender, props } = setup();
  rerender({ ...props, action: sql });
  // Re-declaring the action ends the turn it was prepared under.
  let scope!: ReturnType<typeof result.current.prepareTurn>;
  act(() => {
    scope = result.current.prepareTurn();
  });
  expect(registered.has('set_sql_query')).toBe(true);
  expect(registered.get('set_sql_query')!.inputSchema).toMatchObject({ required: ['sql'], properties: { sql: { type: 'string' } } });
  let outcome;
  await act(async () => {
    outcome = await scope.executePageAction({ ...request, name: 'set_sql_query', args: { sql: 'select 1' } });
  });
  expect(box.fill).toHaveBeenCalledWith('select 1', undefined);
  expect(outcome.result).toMatchObject({ sql: 'draft', datasource_id: 1 });
});
