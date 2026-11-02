import { useRef } from 'react';
import type { Key } from 'react';
import { useMemoizedFn, useSafeState } from 'ahooks';

export default function useRowMutation() {
  const pending = useRef(new Map<Key, Promise<unknown>>());
  const [pendingIds, setPendingIds] = useSafeState<ReadonlySet<Key>>(new Set());
  const run = useMemoizedFn(<T>(ids: readonly Key[], action: () => Promise<T>): Promise<T> => {
    const keys = [...new Set(ids)];
    const previous = keys.flatMap((key) => (pending.current.has(key) ? [pending.current.get(key)!] : []));
    const task = Promise.allSettled(previous).then(action);
    keys.forEach((key) => pending.current.set(key, task));
    setPendingIds(new Set(pending.current.keys()));
    return task.finally(() => {
      keys.forEach((key) => {
        if (pending.current.get(key) === task) pending.current.delete(key);
      });
      setPendingIds(new Set(pending.current.keys()));
    });
  });
  return { run, pendingIds };
}
