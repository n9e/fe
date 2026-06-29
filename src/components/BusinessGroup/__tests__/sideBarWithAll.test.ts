// localStorage mock
const localStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => localStore[key] ?? null,
  setItem: (key: string, value: string) => {
    localStore[key] = value;
  },
  removeItem: (key: string) => {
    delete localStore[key];
  },
  clear: () => {
    Object.keys(localStore).forEach((k) => delete localStore[k]);
  },
  get length() {
    return Object.keys(localStore).length;
  },
  key: (i: number) => Object.keys(localStore)[i] ?? null,
} as Storage;
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });

// Mock 掉 import 链中的 @/App（依赖 import.meta.env，jest 无法解析）
jest.mock('@/App', () => ({
  CommonStateContext: {
    Provider: ({ children }: any) => children,
    Consumer: ({ children }: any) => children,
  },
}));

// Mock 掉 services/tree 等相关模块的 import 链
jest.mock('@/services/manage', () => ({}));
jest.mock('@/services/login', () => ({}));
jest.mock('@/utils/request', () => ({}));
jest.mock('@/utils/constant', () => ({ IS_PLUS: false, N9E_PATHNAME: '', AccessTokenKey: '' }));
jest.mock('@/store/manageInterface', () => ({ ActionType: {} }));
jest.mock('@/components/AuthorizationWrapper', () => ({ useIsAuthorized: () => true, default: ({ children }: any) => children }));
jest.mock('@/pages/user/component/createModal', () => ({ default: () => null }));
jest.mock('@/components/BusinessGroup/components/Tree', () => ({ default: () => null }));
jest.mock('@/components/BusinessGroup/components/EditBusinessDrawer', () => ({ default: () => null }));
jest.mock('@/components/BusinessGroup/BusinessGroupSelect', () => ({ default: () => null }));
jest.mock('@/components/BusinessGroup/BusinessGroupSelectWithAll', () => ({ default: () => null }));
jest.mock('@/components/BusinessGroup/services', () => ({ getBusiGroups: () => Promise.resolve([]) }));
jest.mock('@/components/BusinessGroup/style.less', () => ({}), { virtual: true });
// Mock BusinessGroup/index.tsx 本身（避免加载 react 组件触发复杂渲染）
jest.mock('@/components/BusinessGroup', () => ({ getCleanBusinessGroupIds: (ids: any) => ids?.replace(/^group,/, '') }), { virtual: true });

import { getDefaultGids, getDefaultGidsInDashboard } from '../BusinessGroupSideBarWithAll';

const localeKey = 'N9E_TEST_KEY';
const businessGroup = { ids: '1,2', id: 1, key: 'group,1,2', isLeaf: false };

describe('getDefaultGids', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('URL ids 参数优先', () => {
    const result = getDefaultGids(localeKey, businessGroup, '42');
    expect(result).toBe('42');
  });

  it('URL 无参数时读取 localStorage', () => {
    localStorage.setItem(localeKey, '-2');
    const result = getDefaultGids(localeKey, businessGroup);
    expect(result).toBe('-2');
  });

  it('URL 和 localStorage 都无值时回退到 businessGroup.ids', () => {
    const result = getDefaultGids(localeKey, businessGroup);
    expect(result).toBe('1,2');
  });

  it('全部回退都无值时返回 -2', () => {
    const result = getDefaultGids(localeKey, {});
    expect(result).toBe('-2');
  });

  it('localStorage 优先级高于 businessGroup.ids', () => {
    localStorage.setItem(localeKey, '0');
    const result = getDefaultGids(localeKey, businessGroup);
    expect(result).toBe('0');
  });

  it('URL 有预置筛选 ids=-2 时返回 -2', () => {
    const result = getDefaultGids(localeKey, businessGroup, '-2');
    expect(result).toBe('-2');
  });

  it('URL 有预置筛选 ids=0 时返回 0', () => {
    const result = getDefaultGids(localeKey, businessGroup, '0');
    expect(result).toBe('0');
  });

  it('URL 有 ids 时优先于 localStorage', () => {
    localStorage.setItem(localeKey, '-2');
    const result = getDefaultGids(localeKey, businessGroup, '123');
    expect(result).toBe('123');
  });

  it('localStorage 有值且 URL 无 ids 时使用 localStorage', () => {
    localStorage.setItem(localeKey, '0');
    const result = getDefaultGids(localeKey, businessGroup, undefined);
    expect(result).toBe('0');
  });
});

describe('getDefaultGidsInDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preset-filter=public 时返回 -1', () => {
    const result = getDefaultGidsInDashboard({ 'preset-filter': 'public' }, localeKey, businessGroup);
    expect(result).toBe('-1');
  });

  it('无 preset-filter 时读取 localStorage', () => {
    localStorage.setItem(localeKey, '-2');
    const result = getDefaultGidsInDashboard({}, localeKey, businessGroup);
    expect(result).toBe('-2');
  });

  it('无缓存时回退到 businessGroup.ids', () => {
    const result = getDefaultGidsInDashboard({}, localeKey, businessGroup);
    expect(result).toBe('1,2');
  });

  it('全部回退都无值时返回 -1', () => {
    const result = getDefaultGidsInDashboard({}, localeKey, {});
    expect(result).toBe('-1');
  });

  it('URL 有 preset-filter=public 时忽略 localStorage 返回 -1', () => {
    localStorage.setItem(localeKey, '-2');
    const result = getDefaultGidsInDashboard({ 'preset-filter': 'public' }, localeKey, businessGroup);
    expect(result).toBe('-1');
  });
});
