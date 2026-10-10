jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));

import { getProductDocumentHref, getProductDocumentLink } from './DocLink';

describe('getProductDocumentHref', () => {
  it('opens the provided page document link and keeps ENT links relative', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false)).toBe(pageDocumentUrl);
    expect(getProductDocumentHref(pageDocumentUrl, true)).toBe('/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/');
  });

  it('opens the n9e.github.io page for non-Chinese languages when a mapping exists', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false, 'zh_CN')).toBe(pageDocumentUrl);
    expect(getProductDocumentHref(pageDocumentUrl, false, 'en_US')).toBe('https://n9e.github.io/docs/alerting/overview?from=v9-n9e-user');
    expect(getProductDocumentHref(pageDocumentUrl, false, 'ja_JP')).toBe('https://n9e.github.io/docs/alerting/overview?from=v9-n9e-user');
  });

  it('falls back to the language suffix when n9e.github.io has no matching page', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/zabbix/';

    expect(getProductDocumentHref(pageDocumentUrl, false, 'en_US')).toBe(
      'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/zabbix_en/',
    );
  });

  it('keeps Chinese languages on flashcat.cloud', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false, 'zh_HK')).toBe(
      'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules_hk/',
    );
    // ENT 场景保持相对地址、不加语言后缀
    expect(getProductDocumentHref(pageDocumentUrl, true, 'en_US')).toBe('/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/');
  });
});

describe('getProductDocumentLink', () => {
  it('uses product document link before page document and fallbacks', () => {
    expect(
      getProductDocumentLink({
        productDocLink: '/docs/content/flashcat/polaris/what-is-polaris/',
        doc: '/docs/content/flashcat/polaris/unused-page-doc/',
        siteDocumentUrl: '/docs/content/site-doc/',
      }),
    ).toBe('/docs/content/flashcat/polaris/what-is-polaris/');
  });

  it('falls back from page document to site document and default document', () => {
    expect(getProductDocumentLink({ doc: '/docs/content/page-doc/', siteDocumentUrl: '/docs/content/site-doc/' })).toBe('/docs/content/page-doc/');
    expect(getProductDocumentLink({ siteDocumentUrl: '/docs/content/site-doc/' })).toBe('/docs/content/site-doc/');
    expect(getProductDocumentLink({}, true)).toBe('/docs/content/flashcat/overview/');
    expect(getProductDocumentLink({}, false)).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/');
  });
});
