import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommonStateContext } from '@/App';
import UsageDocs from '@/components/UsageDocs';
import EmptyGuide from './index';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const Context = CommonStateContext as unknown as React.Context<{ emptyMode?: string; hideUsageDocs?: boolean }>;

function renderMode(emptyMode?: string, hideUsageDocs = false) {
  return renderToStaticMarkup(
    <Context.Provider value={{ emptyMode, hideUsageDocs }}>
      <EmptyGuide
        title='List title'
        description='Tutorial details'
        actions={
          <>
            <button>Create</button>
            <UsageDocs>
              <a href='/docs'>Help</a>
            </UsageDocs>
          </>
        }
      />
    </Context.Provider>,
  );
}
it('preserves the existing guide when configuration is absent', () => {
  expect(renderMode()).toContain('Tutorial details');
  expect(renderMode()).toContain('Help');
});
it('simplifies the guide while preserving its title and creation action', () => {
  const html = renderMode('simplify');
  expect(html).toContain('List title');
  expect(html).toContain('Create');
  expect(html).not.toContain('Tutorial details');
});
it('hides guide content and documentation independently without losing the creation action', () => {
  const html = renderMode('hide', true);
  expect(html).toContain('nodata');
  expect(html).toContain('Create');
  expect(html).not.toContain('List title');
  expect(html).not.toContain('Tutorial details');
  expect(html).not.toContain('Help');
});
