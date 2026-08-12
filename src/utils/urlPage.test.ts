import { getPageFromSearch, setPageInSearch, removePageFromSearch } from './urlPage';

describe('getPageFromSearch', () => {
  it('缺省或空 search 返回 1', () => {
    expect(getPageFromSearch('')).toBe(1);
    expect(getPageFromSearch('?')).toBe(1);
    expect(getPageFromSearch('?foo=1')).toBe(1);
  });

  it('读取有效页码', () => {
    expect(getPageFromSearch('?page=3')).toBe(3);
    expect(getPageFromSearch('?foo=1&page=7')).toBe(7);
    expect(getPageFromSearch('?page=10&bar=x')).toBe(10);
  });

  it('非法页码回退到 1', () => {
    expect(getPageFromSearch('?page=abc')).toBe(1);
    expect(getPageFromSearch('?page=0')).toBe(1);
    expect(getPageFromSearch('?page=-2')).toBe(1);
    expect(getPageFromSearch('?page=1.5')).toBe(1);
  });
});

describe('setPageInSearch', () => {
  it('空 search 时仅输出 page', () => {
    expect(setPageInSearch('', 3)).toBe('page=3');
  });

  it('保留既有参数并更新 page', () => {
    expect(setPageInSearch('?foo=1&page=2', 5)).toBe('foo=1&page=5');
    expect(setPageInSearch('?foo=1', 2)).toBe('foo=1&page=2');
  });
});

describe('removePageFromSearch', () => {
  it('移除 page 参数，保留其余参数', () => {
    expect(removePageFromSearch('?foo=1&page=3')).toBe('foo=1');
    expect(removePageFromSearch('?page=3')).toBe('');
  });

  it('无 page 时原样返回', () => {
    expect(removePageFromSearch('?foo=1')).toBe('foo=1');
    expect(removePageFromSearch('')).toBe('');
  });
});
