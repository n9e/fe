import { LokiCompletionCache } from './logqlCompletionCache';

describe('LokiCompletionCache', () => {
  it('removes failed in-flight requests so the next call can retry', async () => {
    const cache = new LokiCompletionCache<string>({ ttlMs: 60 * 1000, maxSize: 10 });
    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce('ok');

    await expect(cache.getOrFetch('labels', fetcher)).rejects.toThrow('temporary failure');
    await expect(cache.getOrFetch('labels', fetcher)).resolves.toBe('ok');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not evict in-flight entries when the cache exceeds maxSize', async () => {
    const cache = new LokiCompletionCache<string>({ ttlMs: 60 * 1000, maxSize: 1 });
    let releaseInflight: (value: string) => void = () => undefined;
    const inflightPromise = cache.getOrFetch('inflight', () => new Promise<string>((resolve) => (releaseInflight = resolve)));

    await cache.getOrFetch('resolved-a', () => Promise.resolve('a'));
    await cache.getOrFetch('resolved-b', () => Promise.resolve('b'));

    releaseInflight('done');
    await inflightPromise;

    const resolveFetcher = jest.fn(() => Promise.resolve('should-not-be-called'));
    await expect(cache.getOrFetch('inflight', resolveFetcher)).resolves.toBe('done');
    expect(resolveFetcher).not.toHaveBeenCalled();
  });
});
