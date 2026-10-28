import React, { createContext, useContext, useState } from 'react';

interface CacheEntry<T> {
  promise: Promise<T>;
  expiresAt?: number;
}

interface CacheOptions<T> {
  ttlMs: number;
  getTtlMs?: (value: T) => number;
}

export interface SharedRequestCache {
  getOrLoad<T>(key: string, loader: () => Promise<T>, options: CacheOptions<T>): Promise<T>;
  invalidate(key: string): void;
  clear(): void;
}

export function createSharedRequestCache(): SharedRequestCache {
  const entries = new Map<string, CacheEntry<unknown>>();

  return {
    getOrLoad<T>(key: string, loader: () => Promise<T>, options: CacheOptions<T>): Promise<T> {
      const cachedEntry = entries.get(key) as CacheEntry<T> | undefined;

      if (cachedEntry && (cachedEntry.expiresAt === undefined || cachedEntry.expiresAt > Date.now())) {
        return cachedEntry.promise;
      }

      if (cachedEntry) {
        entries.delete(key);
      }

      const entry: CacheEntry<T> = {
        promise: Promise.resolve().then(loader),
      };
      const storedEntry = entry as CacheEntry<unknown>;
      entries.set(key, storedEntry);

      entry.promise.then(
        (value) => {
          if (entries.get(key) === storedEntry) {
            entry.expiresAt = Date.now() + Math.max(0, options.getTtlMs?.(value) ?? options.ttlMs);
          }
        },
        () => {
          if (entries.get(key) === storedEntry) {
            entries.delete(key);
          }
        },
      );

      return entry.promise;
    },
    invalidate(key: string) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
}

const SharedRequestCacheContext = createContext<SharedRequestCache | undefined>(undefined);

export function SharedRequestCacheProvider({ children }: React.PropsWithChildren) {
  const [cache] = useState(createSharedRequestCache);

  return <SharedRequestCacheContext.Provider value={cache}>{children}</SharedRequestCacheContext.Provider>;
}

export function useSharedRequestCache() {
  return useContext(SharedRequestCacheContext);
}
