import { HOST_PACK_TAG, hasEnabledHostRule, isHostBoard, readOnboardingMarker, writeOnboardingMarker } from './detect';

describe('isHostBoard', () => {
  it('recognizes a board stamped by the host monitor pack regardless of its name', () => {
    expect(isHostBoard({ name: 'whatever the user renamed it to', tags: HOST_PACK_TAG })).toBe(true);
  });

  it('recognizes the pack tag when it sits alongside other tags', () => {
    expect(isHostBoard({ name: 'x', tags: `Categraf ${HOST_PACK_TAG}` })).toBe(true);
  });

  it('falls back to name hints so dashboards imported before the pack existed still count', () => {
    expect(isHostBoard({ name: '机器常用指标（使用 Categraf 作为采集器）', tags: 'Categraf' })).toBe(true);
    expect(isHostBoard({ name: 'Host Table NG', tags: 'Categraf' })).toBe(true);
  });

  it('matches the name hint case-insensitively', () => {
    expect(isHostBoard({ name: 'MY HOSTS OVERVIEW', tags: '' })).toBe(true);
  });

  it('rejects unrelated boards', () => {
    expect(isHostBoard({ name: 'MySQL 概览', tags: 'MySQL' })).toBe(false);
  });

  it('tolerates missing fields and nullish input', () => {
    expect(isHostBoard({})).toBe(false);
    expect(isHostBoard(undefined)).toBe(false);
    expect(isHostBoard(null)).toBe(false);
  });
});

describe('hasEnabledHostRule', () => {
  it('is true when an enabled host-category rule exists', () => {
    expect(hasEnabledHostRule([{ cate: 'prometheus', disabled: 0 }, { cate: 'host', disabled: 0 }])).toBe(true);
  });

  it('is false when the only host rule is disabled — the user would not actually get alerted', () => {
    expect(hasEnabledHostRule([{ cate: 'host', disabled: 1 }])).toBe(false);
  });

  it('is false when there are rules but none of them are host-category', () => {
    expect(hasEnabledHostRule([{ cate: 'prometheus', disabled: 0 }])).toBe(false);
  });

  it('tolerates empty and nullish input', () => {
    expect(hasEnabledHostRule([])).toBe(false);
    expect(hasEnabledHostRule(undefined)).toBe(false);
    expect(hasEnabledHostRule(null)).toBe(false);
  });
});

describe('onboarding markers', () => {
  const store: Record<string, string> = {};
  const stub = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };

  afterEach(() => {
    Object.keys(store).forEach((key) => delete store[key]);
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('round-trips a marker through localStorage', () => {
    (globalThis as { localStorage?: unknown }).localStorage = stub;
    expect(readOnboardingMarker('testDelivered')).toBe(false);
    writeOnboardingMarker('testDelivered');
    expect(readOnboardingMarker('testDelivered')).toBe(true);
  });

  it('keeps the two markers independent', () => {
    (globalThis as { localStorage?: unknown }).localStorage = stub;
    writeOnboardingMarker('collectVerified');
    expect(readOnboardingMarker('collectVerified')).toBe(true);
    expect(readOnboardingMarker('testDelivered')).toBe(false);
  });

  it('reports false instead of throwing when storage is unavailable', () => {
    // 隐私模式 / 禁用存储：读写都不能把整轮进度探测带崩
    expect(() => writeOnboardingMarker('testDelivered')).not.toThrow();
    expect(readOnboardingMarker('testDelivered')).toBe(false);
  });
});
