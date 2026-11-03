/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import useFieldStatsCache, { parseUniqueCount } from './useFieldStatsCache';
import type { StatsResult } from './types';

const field = { field: 'severity', type: 'string', indexable: true };
const detail: StatsResult = { uniqueCount: 1500, topN: [], stats: { unique_count: '1.5K' } };

it('deduplicates concurrent clicks, caches results across rerenders, and invalidates on a new query', async () => {
  const fetch = jest.fn().mockResolvedValue(3);
  const { result, rerender } = renderHook(({ query }) => useFieldStatsCache(query, undefined, (field) => fetch(field)), { initialProps: { query: 'first' } });
  await act(async () => {
    expect(await Promise.all([result.current.getUniqueCount!(field), result.current.getUniqueCount!(field)])).toEqual([3, 3]);
  });
  rerender({ query: 'first' });
  expect(await result.current.getUniqueCount!(field)).toBe(3);
  expect(fetch).toHaveBeenCalledTimes(1);
  rerender({ query: 'new-range-or-refresh' });
  expect(await result.current.getUniqueCount!(field)).toBe(3);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('reuses raw cardinality from pending details without parsing display text or fetching again', async () => {
  let resolve!: (value: StatsResult) => void;
  const fetchStats = jest.fn(
    () =>
      new Promise<StatsResult>((r) => {
        resolve = r;
      }),
  );
  const fetchCount = jest.fn().mockResolvedValue(2);
  const { result } = renderHook(() => useFieldStatsCache('query', fetchStats, fetchCount));
  const details = result.current.fetchStats!(field);
  const count = result.current.getUniqueCount!(field);
  await act(async () => {
    await Promise.resolve();
    resolve(detail);
    await details;
  });
  expect(await count).toBe(1500);
  expect(fetchCount).not.toHaveBeenCalled();
});

it('accepts empty display statistics and fetches a real count instead of treating missing metrics as zero', async () => {
  const empty: StatsResult = { topN: [], stats: {} };
  const fetchStats = jest.fn(async () => empty);
  const fetchCount = jest.fn(async () => 3);
  const { result } = renderHook(() => useFieldStatsCache('query', fetchStats, fetchCount));
  await expect(result.current.fetchStats!(field)).resolves.toEqual(empty);
  await expect(result.current.getUniqueCount!(field)).resolves.toBe(3);
  expect(fetchCount).toHaveBeenCalledTimes(1);
});

it('does not cache failed or malformed responses and allows retry', async () => {
  const fetch = jest.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(undefined).mockResolvedValueOnce(2);
  const { result } = renderHook(() => useFieldStatsCache('query', undefined, fetch));
  await expect(result.current.getUniqueCount!(field)).rejects.toThrow('network');
  await expect(result.current.getUniqueCount!(field)).rejects.toThrow('cardinality');
  expect(await result.current.getUniqueCount!(field)).toBe(2);
  expect(fetch).toHaveBeenCalledTimes(3);
  for (const value of [null, undefined, '', '2K', -1, 1.5, Infinity]) expect(() => parseUniqueCount(value)).toThrow();
  expect(parseUniqueCount('0')).toBe(0);
});
