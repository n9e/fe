/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import Main from '../Main';
import { createDashboardRuntimeStore, DashboardRuntimeProvider } from '../../globalState';
import initializeVariablesValue from '../utils/initializeVariablesValue';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: () => ({ start: new Date(0), end: new Date(1000) }) }));
jest.mock('../Variable', () => {
  const { useVariableManager } = require('../VariableManagerContext');
  return {
    __esModule: true,
    default: ({ item }: { item: { name: string; label: string } }) => {
      const { updateVariable } = useVariableManager();
      return <button onClick={() => updateVariable(item.name, { value: 'runtime-value' })}>{item.label}</button>;
    },
  };
});

beforeEach(() => localStorage.clear());

function mount(persistState: boolean) {
  const history = createMemoryHistory({ initialEntries: ['/network-devices?device=7&tab=dashboard'] });
  const store = createDashboardRuntimeStore();
  const otherStore = createDashboardRuntimeStore();
  store.setGlobalState('dashboardMeta', { dashboardId: '42' } as never);
  store.setGlobalState('variablesWithOptions', [{ name: 'region', label: 'change region', type: 'textbox', definition: '', datasource: { cate: 'prometheus' }, value: 'initial' }]);
  otherStore.setGlobalState('variablesWithOptions', [{ name: 'region', type: 'textbox', definition: '', datasource: { cate: 'prometheus' }, value: 'other-instance' }]);
  render(
    <Router history={history}>
      <DashboardRuntimeProvider store={store}>
        <Main persistState={persistState} loading={false} variableValueFixed={false} />
      </DashboardRuntimeProvider>
    </Router>,
  );
  return { history, store, otherStore };
}

test('embedded variables remain local to the instance without touching route or ordinary dashboard cache', async () => {
  localStorage.setItem('dashboard_v6_42_region', 'cached');
  const { history, store, otherStore } = mount(false);
  fireEvent.click(screen.getByRole('button', { name: 'change region' }));
  await waitFor(() => expect(store.getGlobalState('variablesWithOptions')[0].value).toBe('runtime-value'));
  expect(history.location.search).toBe('?device=7&tab=dashboard');
  expect(localStorage.getItem('dashboard_v6_42_region')).toBe('cached');
  expect(otherStore.getGlobalState('variablesWithOptions')[0].value).toBe('other-instance');
  expect(
    initializeVariablesValue(
      [{ name: 'region', type: 'textbox', definition: '', datasource: { cate: 'prometheus' }, defaultValue: 'default' }],
      {},
      { dashboardId: 42, persistState: false },
    )[0].value,
  ).toBe('default');
  expect(
    initializeVariablesValue(
      [{ name: 'region', type: 'textbox', definition: '', datasource: { cate: 'prometheus' } }],
      { region: 'from-link' },
      { dashboardId: 42, persistState: false },
    )[0].value,
  ).toBe('from-link');
});

test('ordinary dashboard variables retain existing URL and cache behavior', async () => {
  const { history } = mount(true);
  fireEvent.click(screen.getByRole('button', { name: 'change region' }));
  await waitFor(() => expect(history.location.search).toContain('region=runtime-value'));
  expect(history.location.search).toContain('device=7');
  expect(localStorage.getItem('dashboard_v6_42_region')).toBe('runtime-value');
});
