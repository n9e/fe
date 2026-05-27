jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));

import { getPageDocumentHref, PAGE_DOCUMENT_LABEL_KEY } from './PageDocLink';

describe('getPageDocumentHref', () => {
  it('keeps the page-specific document link for the PageLayout doc entry', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getPageDocumentHref(pageDocumentUrl, false)).toBe(pageDocumentUrl);
    expect(getPageDocumentHref(pageDocumentUrl, true)).toBe('/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/');
    expect(PAGE_DOCUMENT_LABEL_KEY).toBe('common:document_title');
  });
});
