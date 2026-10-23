/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import DocumentDrawer from '@/components/DocumentDrawer';
import { QUERY_BUILDER_PINNED_CACHE_KEY } from '../../constants';
import Main from './index';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ hideUsageDocs: true }) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true, SIZE: 8 }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer', QUERY_INPUT_MIN_WIDTH: 400 }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }) }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/MainMoreOperations', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/SQLFormatButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/QueryBuilder', () => ({ __esModule: true, default: () => <div>builder-fields</div> }));
jest.mock('./Query', () => ({ __esModule: true, default: () => null }));
jest.mock('./SQL', () => ({ __esModule: true, default: () => null }));
jest.mock('./Query/QueryInput', () => ({ __esModule: true, default: () => null }));
jest.mock('./SQL/QueryInput', () => ({
  __esModule: true,
  default: require('react').forwardRef(({ onLableClick }: { onLableClick: () => void }, _ref) => <button onClick={onLableClick}>conditions</button>),
}));

function Fixture() {
  return (
    <Form initialValues={{ query: { syntax: 'sql' } }}>
      <Main
        tabKey='one'
        datasourceValue={1}
        indexData={[]}
        organizeFields={[]}
        setOrganizeFields={() => {}}
        executeQuery={() => {}}
        handleValueFilter={() => {}}
        setStackByField={() => {}}
        setDefaultSearchField={() => {}}
      />
    </Form>
  );
}

beforeEach(() => localStorage.clear());

it('starts closed and unpinned, exposes SQL documentation on click, and closes on an outside click', () => {
  render(<Fixture />);
  expect(screen.queryByRole('button', { name: 'common:document_title' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'conditions' }));
  expect(screen.getByRole('button', { name: /builder\.to_pinned_btn$/ })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'common:document_title' }));
  expect(DocumentDrawer).toHaveBeenCalledWith(expect.objectContaining({ documentPath: expect.stringContaining('what-is-sql-mode-in-doris-discover') }));
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('button', { name: 'common:document_title' })).not.toBeInTheDocument();
  expect(localStorage.getItem(QUERY_BUILDER_PINNED_CACHE_KEY)).toBeNull();
});

it('retains an explicit pin preference, reading the latest saved preference on each mount', () => {
  const first = render(<Fixture />);
  fireEvent.click(screen.getByRole('button', { name: 'conditions' }));
  fireEvent.click(screen.getByRole('button', { name: /builder\.to_pinned_btn$/ }));
  expect(localStorage.getItem(QUERY_BUILDER_PINNED_CACHE_KEY)).toBe('true');
  first.unmount();
  const second = render(<Fixture />);
  expect(screen.getByRole('button', { name: /builder\.to_unpinned_btn$/ })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /builder\.to_unpinned_btn$/ }));
  expect(localStorage.getItem(QUERY_BUILDER_PINNED_CACHE_KEY)).toBe('false');
  second.unmount();
  render(<Fixture />);
  expect(screen.queryByRole('button', { name: 'common:document_title' })).not.toBeInTheDocument();
});
