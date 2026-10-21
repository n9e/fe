import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommonStateContext } from '@/App';
import Help from './index';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true, DatasourceCateEnum: { prometheus: 'prometheus', iotdb: 'iotdb', tdengine: 'tdengine', elasticsearch: 'elasticsearch' } }));
jest.mock('@/components/DocumentDrawer', () => jest.fn());
jest.mock('plus:/constants', () => ({ proDocumentPathMap: {} }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }) }));
const Context = CommonStateContext as unknown as React.Context<{ hideUsageDocs?: boolean }>;

it('removes the entire input addon when usage documents are hidden', () => {
  const html = renderToStaticMarkup(
    <Context.Provider value={{ hideUsageDocs: true }}>
      <Help datasourceCate='prometheus' />
    </Context.Provider>,
  );
  expect(html).toBe('');
});
it('shows the help addon only for a supported datasource', () => {
  expect(renderToStaticMarkup(<Help datasourceCate='prometheus' />)).toContain('ant-input-group-addon');
  expect(renderToStaticMarkup(<Help datasourceCate='unknown' />)).toBe('');
});
