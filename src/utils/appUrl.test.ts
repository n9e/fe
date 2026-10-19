import { addAppBasePrefix, getAppBaseUrl } from './appUrl';

describe('addAppBasePrefix', () => {
  it('根路径部署时保持应用相对路径不变', () => {
    expect(addAppBasePrefix('/dashboards/1', '')).toBe('/dashboards/1');
    expect(addAppBasePrefix('/dashboards/1', '/')).toBe('/dashboards/1');
  });

  it('为应用相对路径补上部署前缀', () => {
    expect(addAppBasePrefix('/dashboards/1', '/flashcat')).toBe('/flashcat/dashboards/1');
    expect(addAppBasePrefix('dashboards/1', '/flashcat')).toBe('/flashcat/dashboards/1');
    expect(addAppBasePrefix('/dashboards/1', '/flashcat/')).toBe('/flashcat/dashboards/1');
  });

  it('已带部署前缀时保持幂等', () => {
    expect(addAppBasePrefix('/flashcat', '/flashcat')).toBe('/flashcat');
    expect(addAppBasePrefix('/flashcat/dashboards/1', '/flashcat')).toBe('/flashcat/dashboards/1');
    expect(addAppBasePrefix('/flashcat?x=1', '/flashcat')).toBe('/flashcat?x=1');
    expect(addAppBasePrefix('/flashcat#top', '/flashcat')).toBe('/flashcat#top');
  });

  it('不改写绝对 URL 和协议相对 URL', () => {
    expect(addAppBasePrefix('https://example.com/path', '/flashcat')).toBe('https://example.com/path');
    expect(addAppBasePrefix('mailto:a@b.com', '/flashcat')).toBe('mailto:a@b.com');
    expect(addAppBasePrefix('//example.com/path', '/flashcat')).toBe('//example.com/path');
  });

  it('空值原样返回', () => {
    expect(addAppBasePrefix('', '/flashcat')).toBe('');
  });
});

describe('getAppBaseUrl', () => {
  it('拼接 origin 与规范化后的部署前缀', () => {
    expect(getAppBaseUrl('https://example.com', '/flashcat')).toBe('https://example.com/flashcat');
    expect(getAppBaseUrl('https://example.com/', '/flashcat/')).toBe('https://example.com/flashcat');
  });

  it('根路径部署时只返回 origin', () => {
    expect(getAppBaseUrl('https://example.com', '')).toBe('https://example.com');
    expect(getAppBaseUrl('https://example.com/', '/')).toBe('https://example.com');
  });
});
