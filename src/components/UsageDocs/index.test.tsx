import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommonStateContext } from '@/App';
import UsageDocs from './index';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));

const Context = CommonStateContext as React.Context<{ hideUsageDocs?: boolean }>;

describe('UsageDocs', () => {
  it('renders its children by default', () => {
    expect(renderToStaticMarkup(<UsageDocs>Product documentation</UsageDocs>)).toContain('Product documentation');
  });

  it('removes the whole entrance when usage documents are hidden', () => {
    const html = renderToStaticMarkup(
      <Context.Provider value={{ hideUsageDocs: true }}>
        <UsageDocs>Product documentation</UsageDocs>
      </Context.Provider>,
    );
    expect(html).toBe('');
  });
});
