interface CacheEntry<T> {
  value?: T;
  promise?: Promise<T>;
  expiresAt: number;
  insertedAt: number;
}

export interface LokiCompletionCacheOptions {
  ttlMs?: number;
  maxSize?: number;
}

export function normalizeCompletionQuery(query?: string) {
  const value = (query || '').trim();
  if (!value || value === '{}') return '{}';
  return value;
}

export function buildCompletionCacheKey(params: { datasourceId?: number; type: string; query?: string; label?: string; keyword?: string }) {
  return [params.datasourceId || '', params.type, normalizeCompletionQuery(params.query), params.label || '', params.keyword || ''].join(':');
}

export class LokiCompletionCache<T> {
  private readonly ttlMs: number;
  private readonly maxSize: number;
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(options: LokiCompletionCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 60 * 1000;
    this.maxSize = options.maxSize ?? 300;
  }

  get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  getOrFetch(key: string, fetcher: () => Promise<T>) {
    const now = Date.now();
    const entry = this.entries.get(key);
    if (entry && entry.expiresAt >= now) {
      if (entry.value !== undefined) return Promise.resolve(entry.value);
      if (entry.promise) return entry.promise;
    }

    const promise = fetcher().then((value) => {
      this.entries.set(key, {
        value,
        expiresAt: Date.now() + this.ttlMs,
        insertedAt: now,
      });
      this.prune();
      return value;
    });

    this.entries.set(key, {
      promise,
      expiresAt: now + this.ttlMs,
      insertedAt: now,
    });
    this.prune();
    return promise;
  }

  clear() {
    this.entries.clear();
  }

  private prune() {
    if (this.entries.size <= this.maxSize) return;
    const sorted = Array.from(this.entries.entries()).sort((a, b) => a[1].insertedAt - b[1].insertedAt);
    for (const [key] of sorted.slice(0, this.entries.size - this.maxSize)) {
      this.entries.delete(key);
    }
  }
}
