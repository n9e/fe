import _ from 'lodash';

// ---------- jsdom 环境模拟（jest 配置为 node） ----------

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

// 模拟 queryString.parse 依赖的 window.location
let mockSearch = '';
jest.mock('query-string', () => ({
  parse: (search: string) => {
    if (!search || search === '?') return {};
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },
  stringify: (obj: Record<string, any>) => {
    return new URLSearchParams(obj as any).toString();
  },
}));

// localStorage / window mock（jest 使用 node 环境，需要手动模拟）
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });
const mockWindow: any = { localStorage: mockLocalStorage, location: { search: '' } };
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
// utils.ts 中直接引用 window，需确保 window 在全局作用域可访问
(globalThis as any).window = mockWindow;

import { getCleanBusinessGroupIds, getDefaultBusinessGroupKey, getDefaultBusiness, getBusinessGroupsOptions, getCollapsedKeys, listToTree } from '../utils';

// ---------- getCleanBusinessGroupIds ----------

describe('getCleanBusinessGroupIds', () => {
  it('应移除 group, 前缀', () => {
    expect(getCleanBusinessGroupIds('group,1,2,3')).toBe('1,2,3');
  });

  it('对纯数字 ids 直接返回', () => {
    expect(getCleanBusinessGroupIds('123')).toBe('123');
  });

  it('对预置筛选值 -2 直接返回', () => {
    expect(getCleanBusinessGroupIds('-2')).toBe('-2');
  });

  it('对预置筛选值 0 直接返回', () => {
    expect(getCleanBusinessGroupIds('0')).toBe('0');
  });

  it('对 pre 预置筛选值 -1 直接返回', () => {
    expect(getCleanBusinessGroupIds('-1')).toBe('-1');
  });

  it('对 group,-2 返回 -2', () => {
    expect(getCleanBusinessGroupIds('group,-2')).toBe('-2');
  });

  it('对 undefined 返回 undefined', () => {
    expect(getCleanBusinessGroupIds(undefined)).toBeUndefined();
  });

  it('幂等性：多次调用相同输入返回相同输出', () => {
    const inputs = ['group,1,2', '123', '-2', '0', '-1', 'group,-2', undefined];
    inputs.forEach((input) => {
      const first = getCleanBusinessGroupIds(input);
      const second = getCleanBusinessGroupIds(input);
      expect(first).toBe(second);
    });
  });
});

// ---------- getDefaultBusinessGroupKey ----------

describe('getDefaultBusinessGroupKey', () => {
  beforeEach(() => {
    (global.window as any).location = { search: '' };
    localStorage.clear();
  });

  it('URL 有 ids 和 isLeaf=true 时应返回纯 ids', () => {
    (global.window as any).location = { search: '?ids=123&isLeaf=true' };
    expect(getDefaultBusinessGroupKey()).toBe('123');
  });

  it('URL 有 ids 和 isLeaf=false 时应返回 group,ids 格式', () => {
    (global.window as any).location = { search: '?ids=1,2&isLeaf=false' };
    expect(getDefaultBusinessGroupKey()).toBe('group,1,2');
  });

  it('URL 有预置筛选值 ids=-2&isLeaf=false 时应返回 group,-2', () => {
    (global.window as any).location = { search: '?ids=-2&isLeaf=false' };
    expect(getDefaultBusinessGroupKey()).toBe('group,-2');
  });

  it('URL 为空时应从 localStorage 读取 businessGroupKey', () => {
    (global.window as any).location = { search: '' };
    localStorage.setItem('businessGroupKey', 'group,1,2');
    expect(getDefaultBusinessGroupKey()).toBe('group,1,2');
  });

  it('URL 和 localStorage 都为空时返回 undefined', () => {
    (global.window as any).location = { search: '' };
    expect(getDefaultBusinessGroupKey()).toBeUndefined();
  });
});

// ---------- getDefaultBusiness ----------

describe('getDefaultBusiness', () => {
  const busiGroups = [
    { id: 1, name: '业务组A' },
    { id: 2, name: '业务组B' },
  ];

  beforeEach(() => {
    (global.window as any).location = { search: '' };
    localStorage.clear();
  });

  afterEach(() => {
    // 恢复 window 上的 localStorage（避免被前序测试污染）
    (global.window as any).localStorage = mockLocalStorage;
  });

  it('URL 有合法 ids 时应从 URL 恢复 businessGroup', () => {
    (global.window as any).location = { search: '?ids=1&isLeaf=true' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: '1', ids: '1', id: 1, isLeaf: true });
  });

  it('URL 有预设值 -2 时应跳过业务组校验', () => {
    (global.window as any).location = { search: '?ids=-2&isLeaf=false' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: 'group,-2', ids: '-2', id: -2, isLeaf: false });
    expect(localStorage.getItem('businessGroupKey')).toBe('group,-2');
  });

  it('URL 有预设值 0 时应跳过业务组校验', () => {
    (global.window as any).location = { search: '?ids=0&isLeaf=false' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: 'group,0', ids: '0', id: 0, isLeaf: false });
  });

  it('localStorage 有缓存时应从缓存恢复', () => {
    (global.window as any).location = { search: '' };
    localStorage.setItem('businessGroupKey', '2');
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: '2', ids: '2', id: 2, isLeaf: true });
  });

  it('URL 和 localStorage 都为空时，取第一个业务组', () => {
    (global.window as any).location = { search: '' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: '1', ids: '1', id: 1, isLeaf: true });
  });

  it('无效的业务组 ID 应回退到第一个业务组', () => {
    (global.window as any).location = { search: '' };
    localStorage.setItem('businessGroupKey', '999');
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: '1', ids: '1', id: 1, isLeaf: true });
  });

  it('URL 优先级高于 localStorage', () => {
    (global.window as any).location = { search: '?ids=1&isLeaf=true' };
    localStorage.setItem('businessGroupKey', '2');
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: '1', ids: '1', id: 1, isLeaf: true });
  });

  it('预置值 -2 不应被业务组存在性校验覆盖', () => {
    (global.window as any).location = { search: '' };
    localStorage.setItem('businessGroupKey', 'group,-2');
    const result = getDefaultBusiness(busiGroups);
    expect(result.ids).toBe('-2');
    expect(result.id).toBe(-2);
  });

  // ---------- 预置筛选 + 缓存冲突场景 ----------

  it('URL 为 ids=-2&isLeaf=false 时正确恢复预置筛选', () => {
    (global.window as any).location = { search: '?ids=-2&isLeaf=false' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: 'group,-2', ids: '-2', id: -2, isLeaf: false });
  });

  it('URL 为 ids=0&isLeaf=false 时正确恢复预置筛选（未分组）', () => {
    (global.window as any).location = { search: '?ids=0&isLeaf=false' };
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: 'group,0', ids: '0', id: 0, isLeaf: false });
  });

  it('URL 有预置筛选 ids=-2，localStorage 有旧树节点时 URL 优先', () => {
    (global.window as any).location = { search: '?ids=-2&isLeaf=false' };
    localStorage.setItem('businessGroupKey', 'group,1,2');
    const result = getDefaultBusiness(busiGroups);
    // URL 优先级高，应返回预置值
    expect(result.ids).toBe('-2');
    expect(result.key).toBe('group,-2');
    // localStorage 的 businessGroupKey 应被覆盖
    expect(localStorage.getItem('businessGroupKey')).toBe('group,-2');
  });

  it('URL 有 ids=1&isLeaf=true，localStorage 有预置值 group,-2 时 URL 优先', () => {
    (global.window as any).location = { search: '?ids=1&isLeaf=true' };
    localStorage.setItem('businessGroupKey', 'group,-2');
    const result = getDefaultBusiness(busiGroups);
    // URL 有特定的业务组 ID（1 在 busiGroups 中存在），应使用 URL 的值
    expect(result.ids).toBe('1');
    expect(result.key).toBe('1');
    expect(localStorage.getItem('businessGroupKey')).toBe('1');
  });

  it('localStorage 有预置值 group,0 时正确恢复', () => {
    (global.window as any).location = { search: '' };
    localStorage.setItem('businessGroupKey', 'group,0');
    const result = getDefaultBusiness(busiGroups);
    expect(result).toEqual({ key: 'group,0', ids: '0', id: 0, isLeaf: false });
  });
});

// ---------- listToTree ----------

describe('listToTree', () => {
  it('应将平铺列表转换为树结构', () => {
    const data = [
      { id: 1, name: '集团A-部门A' },
      { id: 2, name: '集团A-部门B' },
      { id: 3, name: '集团B' },
    ];
    const tree = listToTree(data);
    expect(tree).toHaveLength(2);
    // 集团A 是父节点，key 包含 'group'
    expect(tree[0].key).toContain('group,');
    expect(tree[0].children).toHaveLength(2);
    // 集团B 是叶子节点
    expect(tree[1].key).toBe('3');
  });
});

// ---------- getCollapsedKeys ----------

describe('getCollapsedKeys', () => {
  const treeData = [
    {
      id: 100,
      key: 'group,1,2',
      title: '集团A',
      children: [
        { id: 1, key: '1', title: '部门A', isLeaf: true },
        { id: 2, key: '2', title: '部门B', isLeaf: true },
      ],
    },
    { id: 3, key: '3', title: '集团B', isLeaf: true },
  ];

  it('选中叶子节点时应展开其父节点', () => {
    const collapsed = getCollapsedKeys(treeData, [], '1');
    expect(collapsed).toContain('group,1,2');
  });

  it('选中父节点时无需展开额外的节点', () => {
    const collapsed = getCollapsedKeys(treeData, [], 'group,1,2');
    expect(collapsed).toEqual([]);
  });

  it('空树时应返回空数组', () => {
    expect(getCollapsedKeys([], [], '1')).toEqual([]);
  });
});
