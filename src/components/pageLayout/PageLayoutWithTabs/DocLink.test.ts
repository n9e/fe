jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));

import { getProductDocumentHref } from './DocLink';

describe('getProductDocumentHref', () => {
  it('opens the provided page document link and keeps ENT links relative', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getProductDocumentHref(pageDocumentUrl, false)).toBe(pageDocumentUrl);
    expect(getProductDocumentHref(pageDocumentUrl, true)).toBe('/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/');
  });
});
