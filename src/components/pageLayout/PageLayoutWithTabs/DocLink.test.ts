jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));

import { getProductDocumentHref, getProductDocumentLink } from './DocLink';

describe('getProductDocumentHref', () => {
  it('opens the provided page document link and keeps ENT links relative', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false)).toBe(pageDocumentUrl);
    expect(getProductDocumentHref(pageDocumentUrl, true)).toBe('/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/');
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
