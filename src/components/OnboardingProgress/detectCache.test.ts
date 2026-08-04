import { CACHEABLE_KEYS, DETECT_CACHE_PREFIX, DETECT_CACHE_TTL, PROBE_MIN_INTERVAL, isProbeThrottled, readDetectCache, writeDetectCache } from './detectCache';

// 读写都接受显式的 now，测试统一喂这个基准时间，不依赖真实时钟、也不必上 fake timers
const NOW = 1754200000000;

const store: Record<string, string> = {};
const stub = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
};

function useStorage() {
  (globalThis as { localStorage?: unknown }).localStorage = stub;
}

afterEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe('readDetectCache / writeDetectCache', () => {
  it('round-trips the done list', () => {
    useStorage();
    writeDetectCache(7, ['alert', 'dashboard'], NOW);
    expect(readDetectCache(7, NOW)).toEqual({ done: ['alert', 'dashboard'], at: NOW, establishedAt: NOW });
  });

  it('keeps each user separate — localStorage is origin-scoped, not per account', () => {
    // 同一台电脑换个账号登录不能继承上一个人的完成态，否则新同事一进来引导就是全绿的
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    expect(readDetectCache(8, NOW)).toBeUndefined();
    expect(Object.keys(store)).toEqual([`${DETECT_CACHE_PREFIX}7`]);
  });

  it('drops and cleans up an entry past its TTL', () => {
    // 缓存只增不减，用户把规则删了不会回退，靠 TTL 兜住
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    expect(readDetectCache(7, NOW + DETECT_CACHE_TTL + 1)).toBeUndefined();
    expect(store[`${DETECT_CACHE_PREFIX}7`]).toBeUndefined();
  });

  it('keeps an entry that is exactly at the TTL boundary', () => {
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    expect(readDetectCache(7, NOW + DETECT_CACHE_TTL)?.done).toEqual(['alert']);
  });

  it('still expires on schedule for a user who keeps probing — TTL must not slide with at', () => {
    // 回归防护：at 每轮探测都前移，若拿它算 TTL，活跃用户的有效期会被无限顺延、TTL 永不生效，
    // 把规则删光的用户就会永久停在「已完成」。TTL 必须从 establishedAt 起算
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    // 期间不断有探测落地（完成项没变），模拟一个天天在用的用户
    for (let elapsed = PROBE_MIN_INTERVAL; elapsed < DETECT_CACHE_TTL; elapsed += DETECT_CACHE_TTL / 8) {
      writeDetectCache(7, ['alert'], NOW + elapsed);
    }
    expect(readDetectCache(7, NOW + DETECT_CACHE_TTL + 1)).toBeUndefined();
  });

  it('restarts the TTL only when a new step actually completes', () => {
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    const later = NOW + DETECT_CACHE_TTL / 2;
    writeDetectCache(7, ['alert', 'dashboard'], later);
    // 新完成了一步 → establishedAt 重新计时，原起点早已过期也不影响
    expect(readDetectCache(7, later + DETECT_CACHE_TTL)?.done).toEqual(['alert', 'dashboard']);
    expect(readDetectCache(7, later + DETECT_CACHE_TTL + 1)).toBeUndefined();
  });

  it('keeps sliding at so throttling still tracks the latest probe', () => {
    useStorage();
    writeDetectCache(7, ['alert'], NOW);
    writeDetectCache(7, ['alert'], NOW + 30_000);
    const cache = readDetectCache(7, NOW + 30_000);
    expect(cache?.at).toBe(NOW + 30_000);
    expect(cache?.establishedAt).toBe(NOW);
  });

  it('falls back to at when an entry predates the establishedAt field', () => {
    useStorage();
    store[`${DETECT_CACHE_PREFIX}7`] = JSON.stringify({ done: ['alert'], at: NOW });
    expect(readDetectCache(7, NOW)?.establishedAt).toBe(NOW);
    expect(readDetectCache(7, NOW + DETECT_CACHE_TTL + 1)).toBeUndefined();
  });

  it('returns nothing when there is no entry at all', () => {
    useStorage();
    expect(readDetectCache(7, NOW)).toBeUndefined();
  });

  it('tolerates a hand-corrupted entry instead of throwing', () => {
    // localStorage 用户可改，坏数据只能当作没缓存，不能把整轮探测带崩
    useStorage();
    store[`${DETECT_CACHE_PREFIX}7`] = 'not json';
    expect(readDetectCache(7, NOW)).toBeUndefined();
    store[`${DETECT_CACHE_PREFIX}7`] = JSON.stringify({ done: 'alert', at: NOW });
    expect(readDetectCache(7, NOW)).toBeUndefined();
    store[`${DETECT_CACHE_PREFIX}7`] = JSON.stringify({ done: ['alert'] });
    expect(readDetectCache(7, NOW)).toBeUndefined();
  });

  it('ignores keys it does not recognize, so an older version cannot inject state', () => {
    useStorage();
    store[`${DETECT_CACHE_PREFIX}7`] = JSON.stringify({ done: ['alert', 'somethingRemoved', 42], at: NOW });
    expect(readDetectCache(7, NOW)?.done).toEqual(['alert']);
  });

  it('reports no cache instead of throwing when storage is unavailable', () => {
    // 隐私模式 / 禁用存储：读写都不能打断探测
    expect(() => writeDetectCache(7, ['alert'], NOW)).not.toThrow();
    expect(readDetectCache(7, NOW)).toBeUndefined();
  });
});

describe('CACHEABLE_KEYS', () => {
  it('excludes the three flags that are allowed to go back to false', () => {
    // collectVerified / testDeliveredLocal 自己就是 localStorage 标记（见 detect.ts）；
    // notifyUsed 会随服务端记录按保留期清理而回退，缓存住会与服务端口径打架
    expect(CACHEABLE_KEYS).not.toContain('collectVerified');
    expect(CACHEABLE_KEYS).not.toContain('testDeliveredLocal');
    expect(CACHEABLE_KEYS).not.toContain('notifyUsed');
  });

  it('never persists loaded — it is a probe lifecycle flag, not a completed step', () => {
    expect(CACHEABLE_KEYS).not.toContain('loaded');
  });
});

describe('isProbeThrottled', () => {
  it('skips a probe inside the window', () => {
    expect(isProbeThrottled({ done: [], at: NOW, establishedAt: NOW }, NOW + PROBE_MIN_INTERVAL - 1)).toBe(true);
  });

  it('probes again once the window has passed', () => {
    expect(isProbeThrottled({ done: [], at: NOW, establishedAt: NOW }, NOW + PROBE_MIN_INTERVAL)).toBe(false);
  });

  it('never throttles when there is no cache — a first visit must always probe', () => {
    expect(isProbeThrottled(undefined, NOW)).toBe(false);
  });

  it('throttles on the timestamp alone, not on whether anything was done', () => {
    // 恒为假的项（如没有主机告警时的 hostAlert）没有 true 可缓存，正是要靠时间窗兜住
    expect(isProbeThrottled({ done: [], at: NOW, establishedAt: NOW }, NOW + 1)).toBe(true);
  });
});
