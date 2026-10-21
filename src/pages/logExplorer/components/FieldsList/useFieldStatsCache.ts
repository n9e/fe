import { useMemo, useRef } from 'react';
import { Field, StatsResult } from './types';

export function parseUniqueCount(value: unknown): number {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) throw new Error('Missing cardinality');
  const count = Number(value);
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) throw new Error('Invalid cardinality');
  return count;
}

// One cache per query scope, shared by displayed/available fields and both actions.
// Re-rendering a provider with inline fetch callbacks must not invalidate it.
export default function useFieldStatsCache(key: string | undefined, fetchStats?: (field: Field) => Promise<StatsResult>, fetchUniqueCount?: (field: Field) => Promise<number>) {
  const latest = useRef({ fetchStats, fetchUniqueCount });
  latest.current = { fetchStats, fetchUniqueCount };
  const hasStats = !!fetchStats;
  const hasCount = !!fetchUniqueCount;
  // Providers without an explicit query key retain their original invalidation.
  const fallback = key === undefined ? fetchStats : undefined;
  return useMemo(() => {
    const stats = new Map<string, Promise<StatsResult>>();
    const counts = new Map<string, Promise<number>>();
    const loadStats = async (field: Field) => {
      let request = stats.get(field.field);
      if (!request) {
        const fetch = latest.current.fetchStats!;
        request = Promise.resolve().then(() => fetch(field));
        stats.set(field.field, request);
        request.catch(() => stats.delete(field.field));
      }
      return request;
    };
    return {
      fetchStats: hasStats ? loadStats : undefined,
      getUniqueCount: hasCount
        ? (field: Field) => {
            let request = counts.get(field.field);
            if (!request) {
              const fullStats = stats.get(field.field);
              const fetch = latest.current.fetchUniqueCount!;
              request = (async () => {
                // Reuse an open/completed statistics popover without a second query.
                if (fullStats) {
                  try {
                    const result = await fullStats;
                    if (result.uniqueCount !== undefined) return parseUniqueCount(result.uniqueCount);
                  } catch {
                    // A failed detailed query should not prevent a count-only retry.
                  }
                }
                return parseUniqueCount(await fetch(field));
              })();
              counts.set(field.field, request);
              request.catch(() => counts.delete(field.field));
            }
            return request;
          }
        : undefined,
    };
  }, [key, fallback, hasStats, hasCount]);
}
