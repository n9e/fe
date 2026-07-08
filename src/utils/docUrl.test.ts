import { localizeDocUrl } from './docUrl';

describe('localizeDocUrl', () => {
  const url = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/';

  it('keeps zh_CN urls unchanged', () => {
    expect(localizeDocUrl(url, 'zh_CN')).toBe(url);
  });

  it('appends _en/_hk to the last path segment', () => {
    expect(localizeDocUrl(url, 'en_US')).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc_en/');
    expect(localizeDocUrl(url, 'ja_JP')).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc_en/');
    expect(localizeDocUrl(url, 'zh_HK')).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc_hk/');
  });

  it('preserves query string and hash', () => {
    expect(localizeDocUrl(`${url}?from=n9e-user#step1`, 'en_US')).toBe(
      'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc_en/?from=n9e-user#step1',
    );
  });

  it('leaves non flashcat.cloud urls unchanged', () => {
    expect(localizeDocUrl('https://example.com/docs/custom/', 'en_US')).toBe('https://example.com/docs/custom/');
  });
});
