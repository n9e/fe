/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

import { DashboardRuntimeProvider, createDashboardRuntimeStore } from '../globalState';
import type { IPanel } from '../types';
import Row from './Row';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  useReplaceTemplateVariables: () => (value: string) => value,
}));
jest.mock('../config', () => ({ AddPanelIcon: () => <span>add-panel</span> }));

/** 验证行面板在运行时 Provider 中读取变量，避免渲染 Mentions 时引用未声明的变量。 */
test('renders a row with variable mentions from the dashboard runtime', () => {
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variablesWithOptions', [
    {
      name: 'region',
      definition: 'region',
      type: 'custom',
      datasource: { cate: 'prometheus' },
      value: 'shanghai',
    },
  ]);
  const row = {
    id: 'row-1',
    type: 'row',
    name: 'Region: $region',
    description: '',
    collapsed: false,
    panels: [],
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: 'row-1', x: 0, y: 0, w: 24, h: 1 },
  } satisfies IPanel;

  render(
    <DashboardRuntimeProvider store={store}>
      <Row isAuthorized name={row.name} row={row} onToggle={jest.fn()} onAddClick={jest.fn()} onPasteClick={jest.fn()} onEditClick={jest.fn()} onDeleteClick={jest.fn()} />
    </DashboardRuntimeProvider>,
  );

  expect(screen.getByText('Region: $region')).toBeInTheDocument();
});
