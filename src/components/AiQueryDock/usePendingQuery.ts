import { useCallback, useRef, useState } from 'react';

/** What a run of the statement came back with, for whoever asked for the run. */
export interface QueryResult {
  empty: boolean;
  count?: number;
}
/**
 * One caller's interest in the next fetch. The fetcher receives it as a prop
 * and completes it by closure, so a slow response from an earlier statement
 * can never answer a later request.
 */
export interface QueryRequest {
  signal: AbortSignal;
  complete: (result: QueryResult | Error) => void;
}

/**
 * One run of a panel's query at a time. `begin` returns a promise for the
 * next fetch and exposes the request the fetcher must complete; `abort`
 * settles the run as stopped; `clear` also drops the request so a fetch the
 * user starts by hand answers nobody.
 */
export function usePendingQuery() {
  const pendingRef = useRef<{ abort: () => void }>();
  const [queryRequest, setQueryRequest] = useState<QueryRequest>();
  const abort = useCallback(() => pendingRef.current?.abort(), []);
  const clear = useCallback(() => {
    pendingRef.current?.abort();
    setQueryRequest(undefined);
  }, []);
  const begin = useCallback((signal?: AbortSignal) => {
    pendingRef.current?.abort();
    if (signal?.aborted) return Promise.reject(new DOMException('Query stopped', 'AbortError'));
    const controller = new AbortController();
    return new Promise<QueryResult>((resolve, reject) => {
      let settled = false;
      const complete = (result: QueryResult | Error) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', stop);
        if (pendingRef.current?.abort === stop) pendingRef.current = undefined;
        if (result instanceof Error) reject(result);
        else resolve(result);
      };
      const stop = () => {
        controller.abort();
        complete(new DOMException('Query stopped', 'AbortError'));
      };
      pendingRef.current = { abort: stop };
      signal?.addEventListener('abort', stop, { once: true });
      setQueryRequest({ signal: controller.signal, complete });
    });
  }, []);
  return { queryRequest, begin, abort, clear };
}
