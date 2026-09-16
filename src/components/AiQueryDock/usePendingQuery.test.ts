/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { usePendingQuery } from './usePendingQuery';

it('resolves the run the fetcher completes and hands it the request', async () => {
  const { result } = renderHook(() => usePendingQuery());
  let run!: Promise<{ empty: boolean; count?: number }>;
  act(() => {
    run = result.current.begin();
  });
  expect(result.current.queryRequest).toBeDefined();
  act(() => result.current.queryRequest!.complete({ empty: false, count: 3 }));
  await expect(run).resolves.toEqual({ empty: false, count: 3 });
});

it('never lets a slow earlier run answer for a later one', async () => {
  const { result } = renderHook(() => usePendingQuery());
  let first!: Promise<unknown>;
  act(() => {
    first = result.current.begin().catch((error: Error) => error.name);
  });
  const firstRequest = result.current.queryRequest!;
  let second!: Promise<{ empty: boolean; count?: number }>;
  act(() => {
    second = result.current.begin();
  });
  expect(firstRequest.signal.aborted).toBe(true);
  act(() => firstRequest.complete({ empty: true, count: 0 }));
  await expect(first).resolves.toBe('AbortError');
  act(() => result.current.queryRequest!.complete({ empty: false, count: 5 }));
  await expect(second).resolves.toEqual({ empty: false, count: 5 });
});

it('stops a run when the caller aborts, and clear drops the request', async () => {
  const { result } = renderHook(() => usePendingQuery());
  const controller = new AbortController();
  let run!: Promise<unknown>;
  act(() => {
    run = result.current.begin(controller.signal).catch((error: Error) => error.name);
  });
  act(() => controller.abort());
  await expect(run).resolves.toBe('AbortError');
  act(() => result.current.clear());
  expect(result.current.queryRequest).toBeUndefined();
});
