jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));

import { getProductDocumentHref, PRODUCT_DOCUMENT_URL, PRODUCT_DOCUMENT_URL_ENT } from './DocLink';

describe('getProductDocumentHref', () => {
  it('ignores page-specific document links and uses the product docs homepage', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false)).toBe(PRODUCT_DOCUMENT_URL);
    expect(getProductDocumentHref(pageDocumentUrl, true)).toBe(PRODUCT_DOCUMENT_URL_ENT);
  });
});
