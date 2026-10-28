/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import QueryInput from './QueryInput';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('@/plugins/doris/constants', () => ({ NAME_SPACE: 'doris' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }) }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/pages/logExplorer/components/QueryInput', () => ({ __esModule: true, default: () => <input aria-label='query-editor' /> }));
jest.mock('../../components/QueryInputAddonAfter', () => ({ __esModule: true, default: () => null }));

const Context = CommonStateContext as unknown as React.Context<{ hideUsageDocs: boolean; darkMode: boolean }>;

it.each([true, false])('keeps query help and its syntax documentation available when hideUsageDocs is %s', async (hideUsageDocs) => {
  render(
    <Context.Provider value={{ hideUsageDocs, darkMode: false }}>
      <Form>
        <QueryInput snapRangeRef={{ current: {} }} executeQuery={() => {}} setDefaultSearchField={() => {}} />
      </Form>
    </Context.Provider>,
  );
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'guidance.query_title' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent('guidance.query_intro');
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.default_search');
  fireEvent.click(screen.getByRole('button', { name: 'guidance.docs →' }));
  expect(DocumentDrawer).toHaveBeenCalledWith(expect.objectContaining({ documentPath: expect.stringContaining('what-is-query-mode-in-doris-discover') }));
});
