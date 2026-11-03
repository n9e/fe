/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogExplorer from './index';

jest.mock('@/App', () => {
  const React = require('react');
  return { CommonStateContext: React.createContext({ datasourceList: [{ id: 1, plugin_type: 'doris' }], groupedDatasourceList: { doris: [{ id: 1 }] } }) };
});
jest.mock('@/utils', () => ({ getDefaultDatasourceValue: () => 1 }));
jest.mock('@/utils/constant', () => ({ IS_ENT: false, DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('@/components/AdvancedWrap/utils', () => ({ allCates: [{ value: 'doris' }] }));
jest.mock('@/components/TimeRangePicker', () => ({ isMathString: (value: unknown) => typeof value === 'string' && value.startsWith('now'), parseRange: () => ({}) }));
jest.mock('./utils/getFormValuesBySearchParams', () => ({ __esModule: true, default: () => undefined }));
jest.mock('./utils/datasourceAvailability', () => ({ isLogExplorerDatasourceCateSupported: () => true }));
jest.mock('@/components/pageLayout', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('./Header', () => () => null);
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }), Trans: () => null }));
jest.mock('./Explorer', () => ({
  __esModule: true,
  default: ({ tabKey, defaultFormValuesControl: control }: any) => (
    <div>
      <span data-testid={`view-${tabKey}`}>{control.selectedViewId ?? 'none'}</span>
      <span data-testid={`query-${tabKey}`}>{control.defaultFormValues?.query?.query}</span>
      <button onClick={() => control.setSelectedViewId(17)}>{`select-${tabKey}`}</button>
      <button onClick={() => control.setDefaultFormValues({ datasourceCate: 'doris', datasourceValue: 1, query: { query: 'edited-condition' } })}>{`query-${tabKey}`}</button>
    </div>
  ),
}));

it('persists view IDs per tab, keeps them on query updates, and restores after remount', async () => {
  const items = ['a', 'b'].map((key) => ({
    key,
    formValues: { datasourceCate: 'doris', datasourceValue: 1, query: { query: 'original', range: { start: 'now-1h', end: 'now' } } },
  }));
  localStorage.setItem('ng_logs_explorer_items', JSON.stringify(items));
  localStorage.setItem('ng_logs_explorer_items_active_key', 'a');
  const page = () => (
    <MemoryRouter initialEntries={['/log/explorer']}>
      <LogExplorer />
    </MemoryRouter>
  );
  const first = render(page());
  fireEvent.click(screen.getByRole('button', { name: 'select-a' }));
  fireEvent.click(screen.getByRole('button', { name: 'query-a' }));
  // Flush the debounce on browser navigation/refresh, even before its delay elapses.
  fireEvent(window, new Event('pagehide'));
  expect(JSON.parse(localStorage.getItem('ng_logs_explorer_items')!)[0].selectedViewId).toBe(17);
  await waitFor(() => {
    const stored = JSON.parse(localStorage.getItem('ng_logs_explorer_items')!);
    expect(stored[0].selectedViewId).toBe(17);
    expect(stored[0].formValues.query.query).toBe('edited-condition');
    expect(stored[1].selectedViewId).toBeUndefined();
  });
  first.unmount();
  render(page());
  expect(screen.getByTestId('view-a')).toHaveTextContent('17');
  expect(screen.getByTestId('view-b')).toHaveTextContent('none');
  expect(screen.getByTestId('query-a')).toHaveTextContent('edited-condition');
});
