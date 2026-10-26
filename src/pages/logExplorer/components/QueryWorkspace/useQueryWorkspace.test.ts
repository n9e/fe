/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import useQueryWorkspace from './useQueryWorkspace';
import type { GeneratedQuery, QueryWorkspaceAdapter } from './types';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const generated = { statement: 'SELECT count(*) FROM logs', metadata: { chart: 'table', valueKeys: ['count'] } };

function setup<Metadata = typeof generated.metadata>(result: GeneratedQuery<Metadata> = generated as GeneratedQuery<Metadata>) {
  const adapter = {
    build: jest.fn(async () => result),
    applyGenerated: jest.fn(),
    resetBuilder: jest.fn(),
    clearStatement: jest.fn(),
    execute: jest.fn(),
  } satisfies QueryWorkspaceAdapter<Metadata>;
  const hook = renderHook(({ contextKey }) => useQueryWorkspace({ ...adapter, contextKey }), { initialProps: { contextKey: 'source/table' } });
  const enable = () => act(() => hook.result.current.setAssistEnabled(true));
  return { ...hook, adapter, enable };
}

it('starts in manual mode and runs without building or parsing the statement', async () => {
  const { result, adapter } = setup();
  expect(result.current.assistEnabled).toBe(false);
  await act(async () => {
    await result.current.run();
  });
  expect(adapter.execute).toHaveBeenCalledTimes(1);
  expect(adapter.build).not.toHaveBeenCalled();
});

it('converts without running, then always builds the latest form before running', async () => {
  const { result, adapter, enable } = setup();
  enable();
  expect(adapter.build).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.convert();
  });
  expect(result.current.preview).toEqual(generated);
  expect(adapter.applyGenerated).toHaveBeenCalledWith(generated);
  expect(adapter.execute).not.toHaveBeenCalled();
  act(() => result.current.markDirty());
  expect(result.current.dirty).toBe(true);
  await act(async () => {
    await result.current.run();
  });
  expect(adapter.build).toHaveBeenCalledTimes(2);
  expect(adapter.execute).toHaveBeenCalledTimes(1);
  expect(adapter.applyGenerated.mock.invocationCallOrder[1]).toBeLessThan(adapter.execute.mock.invocationCallOrder[0]);
  expect(result.current.dirty).toBe(false);
});

it('preserves opaque metadata for other data-source adapters', async () => {
  const other = { statement: 'FROM other_index', metadata: { timestamp: 'event_time', extra: { pluginOption: 42 } } };
  const { result, adapter, enable } = setup(other);
  enable();
  await act(async () => {
    await result.current.convert();
  });
  expect(adapter.applyGenerated).toHaveBeenCalledWith(other);
});

it('preserves the preview and statement on build failure and never executes', async () => {
  const { result, adapter, enable } = setup();
  enable();
  await act(async () => {
    await result.current.convert();
  });
  const error = new Error('server unavailable');
  adapter.build.mockRejectedValueOnce(error);
  await act(async () => {
    await result.current.run();
  });
  expect(result.current.preview).toEqual(generated);
  expect(result.current.error).toBe(error);
  expect(adapter.applyGenerated).toHaveBeenCalledTimes(1);
  expect(adapter.execute).not.toHaveBeenCalled();
  expect(result.current.generating).toBe(false);
});

it('ignores duplicate clicks while building', async () => {
  const pending = deferred<typeof generated>();
  const { result, adapter, enable } = setup();
  adapter.build.mockReturnValue(pending.promise);
  enable();
  let first!: Promise<void>;
  act(() => {
    first = result.current.run();
    void result.current.convert();
    void result.current.run();
  });
  expect(adapter.build).toHaveBeenCalledTimes(1);
  await act(async () => {
    pending.resolve(generated);
    await first;
  });
  expect(adapter.execute).toHaveBeenCalledTimes(1);
});

it.each(['edit', 'reset', 'manual', 'context'] as const)('discards a build after %s', async (action) => {
  const pending = deferred<typeof generated>();
  const { result, adapter, enable, rerender } = setup();
  adapter.build.mockReturnValue(pending.promise);
  enable();
  let run!: Promise<void>;
  act(() => {
    run = result.current.run();
  });
  if (action === 'edit') act(() => result.current.markDirty());
  if (action === 'reset') act(() => result.current.reset());
  if (action === 'manual') act(() => result.current.enterManual());
  if (action === 'context') rerender({ contextKey: 'source/another_table' });
  await act(async () => {
    pending.resolve(generated);
    await run;
  });
  expect(adapter.applyGenerated).not.toHaveBeenCalled();
  expect(adapter.execute).not.toHaveBeenCalled();
  expect(result.current.generating).toBe(false);
});

it('cannot overwrite a newer conversion when an older request finishes later', async () => {
  const pending = deferred<typeof generated>();
  const { result, adapter, enable } = setup();
  adapter.build.mockReturnValueOnce(pending.promise);
  enable();
  let first!: Promise<void>;
  act(() => {
    first = result.current.convert();
    result.current.markDirty();
  });
  const newer = { ...generated, statement: 'SELECT new_value FROM logs' };
  adapter.build.mockResolvedValueOnce(newer);
  await act(async () => {
    await result.current.convert();
  });
  await act(async () => {
    pending.resolve(generated);
    await first;
  });
  expect(result.current.preview).toEqual(newer);
  expect(adapter.applyGenerated).toHaveBeenCalledTimes(1);
});

it('resets only the current editing mode and carries the preview into manual editing', async () => {
  const { result, adapter, enable } = setup();
  act(() => result.current.reset());
  expect(adapter.clearStatement).toHaveBeenCalledTimes(1);
  expect(adapter.resetBuilder).not.toHaveBeenCalled();
  enable();
  await act(async () => {
    await result.current.convert();
  });
  act(() => {
    result.current.markDirty();
    result.current.continueWriting();
  });
  expect(result.current.assistEnabled).toBe(false);
  expect(adapter.applyGenerated).toHaveBeenLastCalledWith(generated);
  expect(result.current.dirty).toBe(true);
  enable();
  act(() => result.current.reset());
  expect(adapter.resetBuilder).toHaveBeenCalledTimes(1);
  expect(result.current.preview).toBeUndefined();
  expect(result.current.dirty).toBe(false);
});

it('drops the builder configuration in either mode without touching the statement', async () => {
  const { result, adapter, enable } = setup();
  enable();
  await act(async () => {
    await result.current.convert();
  });
  act(() => result.current.markDirty());
  act(() => result.current.resetBuilder());
  expect(adapter.resetBuilder).toHaveBeenCalledTimes(1);
  expect(adapter.clearStatement).not.toHaveBeenCalled();
  expect(result.current.preview).toBeUndefined();
  expect(result.current.dirty).toBe(false);

  act(() => result.current.enterManual());
  act(() => result.current.resetBuilder());
  expect(adapter.resetBuilder).toHaveBeenCalledTimes(2);
  expect(adapter.clearStatement).not.toHaveBeenCalled();
  expect(result.current.assistEnabled).toBe(false);
});

it('does not apply a response after unmounting', async () => {
  const pending = deferred<typeof generated>();
  const { result, adapter, enable, unmount } = setup();
  adapter.build.mockReturnValue(pending.promise);
  enable();
  let run!: Promise<void>;
  act(() => {
    run = result.current.run();
  });
  unmount();
  pending.resolve(generated);
  await run;
  expect(adapter.applyGenerated).not.toHaveBeenCalled();
});
