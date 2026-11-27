import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// Each page/drawer owns a scope; unrelated requests never drive its refresh indicator.
const LoadingContext = createContext(false);
const ReportContext = createContext<(id: symbol, loading: boolean) => void>(() => {});
export function RefreshScope({ children }: { children: React.ReactNode }) {
  const entries = useRef(new Set<symbol>());
  const [loading, setLoading] = useState(false);
  const report = useCallback((id: symbol, active: boolean) => {
    if (active) entries.current.add(id);
    else entries.current.delete(id);
    setLoading(entries.current.size > 0);
  }, []);
  return (
    <ReportContext.Provider value={report}>
      <LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider>
    </ReportContext.Provider>
  );
}
export function useRefreshLoading() {
  return useContext(LoadingContext);
}
export function useReportQueryLoading(loading: boolean) {
  const report = useContext(ReportContext);
  const id = useRef(Symbol('query'));
  useEffect(() => {
    report(id.current, loading);
    return () => report(id.current, false);
  }, [report, loading]);
}

export function withRefreshScope<P extends object>(Component: React.ComponentType<P>) {
  return function ScopedRefresh(props: P) {
    return (
      <RefreshScope>
        <Component {...props} />
      </RefreshScope>
    );
  };
}

// A failed chart must not mark a parallel refresh finished while its siblings still run.
export async function waitForQueryBatch<T extends readonly unknown[]>(requests: readonly [...T]): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }> {
  const results = await Promise.allSettled(requests);
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
  return results.map((result) => (result.status === 'fulfilled' ? result.value : undefined)) as { -readonly [K in keyof T]: Awaited<T[K]> };
}
