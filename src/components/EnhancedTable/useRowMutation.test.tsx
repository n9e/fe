/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useRowMutation from './useRowMutation';

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

it.each([
  [[1], [1]],
  [[1], [1, 2]],
  [[1, 2], [2]],
  [
    [1, 2],
    [2, 3],
  ],
  [
    [1, 1],
    [1, 1],
  ],
])('queues overlapping writes %j then %j', async (firstIds, secondIds) => {
  const { result } = renderHook(useRowMutation);
  const first = deferred();
  const second = deferred();
  const action = jest.fn(() => second.promise);
  let firstResult!: Promise<void>;
  let secondResult!: Promise<void>;
  await act(async () => {
    firstResult = result.current.run(firstIds, () => first.promise);
    secondResult = result.current.run(secondIds, action);
  });
  expect(action).not.toHaveBeenCalled();
  expect(result.current.pendingIds).toEqual(new Set([...firstIds, ...secondIds]));
  await act(async () => {
    first.resolve();
    await firstResult;
  });
  expect(action).toHaveBeenCalledTimes(1);
  expect(result.current.pendingIds).toEqual(new Set(secondIds));
  await act(async () => {
    second.resolve();
    await secondResult;
  });
  expect(result.current.pendingIds.size).toBe(0);
});

it('lets disjoint rows finish independently and returns the action value', async () => {
  const { result } = renderHook(useRowMutation);
  const first = deferred();
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.run([1], () => first.promise);
    expect(await result.current.run([2], async () => 42)).toBe(42);
  });
  expect(result.current.pendingIds).toEqual(new Set([1]));
  await act(async () => {
    first.resolve();
    await pending;
  });
});

it('preserves failures and runs queued writes after rejection', async () => {
  const { result } = renderHook(useRowMutation);
  const first = deferred();
  const error = new Error('write failed');
  let rejected!: Promise<unknown>;
  let next!: Promise<string>;
  await act(async () => {
    rejected = result.current.run([1], () => first.promise).catch((reason) => reason);
    next = result.current.run([1], async () => 'saved');
  });
  await act(async () => {
    first.reject(error);
    expect(await rejected).toBe(error);
    expect(await next).toBe('saved');
  });
  expect(result.current.pendingIds.size).toBe(0);
  await act(async () => {
    expect(await result.current.run([1], async () => 'again')).toBe('again');
  });
});

it('finishes pending writes safely after unmount', async () => {
  const { result, unmount } = renderHook(useRowMutation);
  const first = deferred();
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.run([1], () => first.promise);
  });
  unmount();
  first.resolve();
  await expect(pending).resolves.toBeUndefined();
});
