jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));
jest.mock('@/components/DocumentDrawer', () => jest.fn());
jest.mock('@/App', () => {
  const React = require('react');
  return { CommonStateContext: React.createContext({ darkMode: false }) };
});

import { getPageDocumentDrawerOptions, PAGE_DOCUMENT_LABEL_KEY } from './PageDocLink';

describe('getPageDocumentDrawerOptions', () => {
  it('opens the page-specific document in a drawer', () => {
    const pageDocumentUrl = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

    expect(getPageDocumentDrawerOptions(pageDocumentUrl, '说明文档', 'zh_CN', true)).toEqual({
      darkMode: true,
      documentPath: pageDocumentUrl,
      language: 'zh_CN',
      title: '说明文档',
      type: 'iframe',
    });
    expect(PAGE_DOCUMENT_LABEL_KEY).toBe('common:document_title');
  });
});
