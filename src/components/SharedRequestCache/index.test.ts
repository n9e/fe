import { createSharedRequestCache } from './index';

describe('createSharedRequestCache', () => {
  it('同一个 key 的并发请求只执行一次 loader', async () => {
    const cache = createSharedRequestCache();
    let loadCount = 0;
    const load = async () => {
      loadCount += 1;
      return { value: 'shared' };
    };

    const [first, second] = await Promise.all([cache.getOrLoad('same', load, { ttlMs: 1000 }), cache.getOrLoad('same', load, { ttlMs: 1000 })]);

    expect(loadCount).toBe(1);
    expect(first).toEqual({ value: 'shared' });
    expect(first).toBe(second);
  });

  it('不同 key 分别执行 loader', async () => {
    const cache = createSharedRequestCache();
    let loadCount = 0;
    const load = async () => ++loadCount;

    const values = await Promise.all([cache.getOrLoad('first', load, { ttlMs: 1000 }), cache.getOrLoad('second', load, { ttlMs: 1000 })]);

    expect(loadCount).toBe(2);
    expect(values).toEqual([1, 2]);
  });

  it('loader 拒绝后删除缓存，后续请求可以重试', async () => {
    const cache = createSharedRequestCache();
    let loadCount = 0;
    const load = async () => {
      loadCount += 1;
      if (loadCount === 1) throw new Error('network failed');
      return 'recovered';
    };

    await expect(cache.getOrLoad('retry', load, { ttlMs: 1000 })).rejects.toThrow('network failed');
    expect(await cache.getOrLoad('retry', load, { ttlMs: 1000 })).toBe('recovered');
    expect(loadCount).toBe(2);
  });

  it('invalidate 会让已完成的请求重新加载', async () => {
    const cache = createSharedRequestCache();
    let loadCount = 0;
    const load = async () => ++loadCount;

    expect(await cache.getOrLoad('reload', load, { ttlMs: 1000 })).toBe(1);
    cache.invalidate('reload');
    expect(await cache.getOrLoad('reload', load, { ttlMs: 1000 })).toBe(2);
  });
});
