/**
 * 引导进度探测结论的本地缓存。
 *
 * 抽出来的理由与 detect.ts 相同：TTL 过期、脏数据容错、「只写 true」这几条规则可以脱离 React
 * 与五个 service mock 直接单测；缓存 key 的拼法也只有一处实现，不会两边写岔。
 */

/**
 * 缓存 key 前缀，后面拼当前用户 id。
 *
 * 必须按用户隔离：localStorage 是 origin 级的，而 machine / dashboard / alert 这些探的是
 * 「当前用户可见业务组内是否存在」—— 同一台电脑换个账号登录会直接继承上一个人的完成态，
 * 新同事一进来引导就是全绿的，一句指引都看不到。
 * 版本号与 useOnboardingProgress 里的 ONBOARDING_DONE_KEY 保持同步：步骤集合变了就整体作废。
 */
export const DETECT_CACHE_PREFIX = 'n9e_onboarding_detect_v2_';

/**
 * 缓存有效期，从 establishedAt（而不是 at）起算。缓存只增不减（见 CACHEABLE_KEYS），
 * 用户把规则删了 / 停用了不会回退，靠它兜住，避免长期停在错误的完成态。
 * 语义是「距上一次有新步骤完成超过 7 天，就整体作废、从头重探一次」。
 * 7 天与服务端通知记录的默认清理周期对齐。
 */
export const DETECT_CACHE_TTL = 7 * 24 * 3600 * 1000;

/**
 * 两次探测的最小间隔。
 *
 * 光靠缓存止不住重复请求：hostAlert 要求存在启用中的 cate=host 规则，而内置库里的 host 规则
 * 一律以 disabled=1 出厂，对多数部署它恒为假 —— 恒假的项没有 true 可缓存，probeOnboarding 里
 * alertP 的跳过条件便永远闭合不了，每切一次路由就要重拉一遍全量告警规则列表。所以已完成项
 * 交给缓存、未完成项交给这个时间窗。
 *
 * 取 60 秒而不是更长：九步里有八步在完成处显式调了 refreshOnboardingProgress（不经过这里，
 * 点完即时变绿），只有 llm、以及从常规页面（而非基础包）创建的大盘 / 告警规则要靠路由探测
 * 兜底。窗口越长这几种情况变绿越慢，而连续点击造成的请求风暴在几秒内就聚齐了，60 秒已经
 * 足以把它压成一次。
 */
export const PROBE_MIN_INTERVAL = 60 * 1000;

/**
 * 可进缓存的探测项：只放「存在性」判定，且**只缓存 true、绝不缓存 false**
 * —— 一次网络抖动探到的 false 若被固化，用户就再也点不亮那一步。
 *
 * 另外三项有意不在这里：collectVerified / testDeliveredLocal 自己就是 localStorage 标记
 * （见 detect.ts），notifyUsed 会随服务端记录按保留期清理而回退，缓存住反而与服务端口径打架。
 */
export const CACHEABLE_KEYS = ['machine', 'dashboard', 'hostDashboard', 'alert', 'hostAlert', 'hostNotifyBound', 'notification', 'llm'] as const;

export type CacheableKey = (typeof CACHEABLE_KEYS)[number];

export interface DetectCache {
  /** 已完成的探测项，恒为 CACHEABLE_KEYS 的子集 */
  done: string[];
  /** 上一轮真实探测的完成时间，只用于探测节流 —— 每轮探测都会前移 */
  at: number;
  /**
   * 当前这份 done 集合最早被确立的时间，只用于 TTL —— 只在 done 真的变化时才前移。
   *
   * 必须与 at 分开：at 每轮探测都刷新，活跃用户每分钟就会顶一次，若拿它算 TTL，
   * 有效期会被无限顺延、TTL 等于永不生效，删了规则的用户就会永久停在「已完成」。
   */
  establishedAt: number;
}

function cacheKey(uid: number): string {
  return `${DETECT_CACHE_PREFIX}${uid}`;
}

/** done 只增不减，但仍按集合比较，不依赖写入顺序 */
function isSameDone(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

/**
 * 读缓存。localStorage 在隐私模式 / 禁用存储时会抛错，读不到一律当没缓存，不能打断整轮探测。
 * 过期即顺手清掉，不给同一个用户留垃圾。
 */
export function readDetectCache(uid: number, now: number = Date.now()): DetectCache | undefined {
  const key = cacheKey(uid);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // 存储可被用户手工改坏，形状不对就当没有
    if (!Array.isArray(parsed?.done) || typeof parsed?.at !== 'number') return undefined;
    // 老条目没有 establishedAt 字段，退回用 at，行为与加这个字段之前一致
    const establishedAt = typeof parsed.establishedAt === 'number' ? parsed.establishedAt : parsed.at;
    if (now - establishedAt > DETECT_CACHE_TTL) {
      localStorage.removeItem(key);
      return undefined;
    }
    // 只认识 CACHEABLE_KEYS 里的项：写缓存时的键集合可能来自旧版本
    return {
      done: parsed.done.filter((item: unknown) => typeof item === 'string' && (CACHEABLE_KEYS as readonly string[]).includes(item)),
      at: parsed.at,
      establishedAt,
    };
  } catch (e) {
    return undefined;
  }
}

/** 写缓存。done 由调用方从当前状态里为真的项现算，false 永远不落盘 */
export function writeDetectCache(uid: number, done: readonly string[], now: number = Date.now()) {
  try {
    const previous = readDetectCache(uid, now);
    // 完成项没变就沿用原来的 establishedAt，别把 TTL 顺延（见 DetectCache.establishedAt）
    const establishedAt = previous && isSameDone(previous.done, done) ? previous.establishedAt : now;
    localStorage.setItem(cacheKey(uid), JSON.stringify({ done, at: now, establishedAt } as DetectCache));
  } catch (e) {
    // 存不下只影响下次要不要重新探测，不值得打断渲染
  }
}

/** 距上一轮探测还在最小间隔内 —— 本次路由变化不必再探 */
export function isProbeThrottled(cache: DetectCache | undefined, now: number = Date.now()): boolean {
  if (!cache) return false;
  return now - cache.at < PROBE_MIN_INTERVAL;
}
