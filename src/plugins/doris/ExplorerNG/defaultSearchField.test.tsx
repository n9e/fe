/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Explorer from './index';

const mockSetFields = jest.fn();
jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }), Trans: () => null }));
jest.mock('antd', () => ({ ...jest.requireActual('antd'), Form: { Item: () => null, useFormInstance: () => ({ setFieldsValue: mockSetFields }), useWatch: () => undefined } }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/HistoricalRecords/ConditionHistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/HistoricalRecords', () => ({ setLocalQueryHistory: jest.fn() }));
jest.mock('@/components/DocumentDrawer', () => () => null);
jest.mock('@/components/UsageDocs', () => () => null);
jest.mock('@/pages/logExplorer/components/SideBar', () => ({ children }: any) => <div>{children}</div>);
jest.mock('../constants', () => ({ NAME_SPACE: 'doris' }));
jest.mock('./aiDock', () => ({ useDorisAiDock: () => ({ invalidate: jest.fn() }) }));
jest.mock('./Main', () => () => null);
jest.mock('./SideBarNav', () => ({ setDefaultSearchField }: any) => <button onClick={() => setDefaultSearchField(undefined)}>clear default</button>);

it('clears only the default field, leaving existing qualified or bare input intact', () => {
  render(<Explorer tabKey='query' renderCommonSettings={() => null} />);
  fireEvent.click(screen.getByRole('button', { name: 'clear default' }));
  expect(mockSetFields).toHaveBeenCalledWith({ query: { defaultSearchField: undefined } });
  expect(mockSetFields.mock.calls[0][0].query).not.toHaveProperty('query');
});
