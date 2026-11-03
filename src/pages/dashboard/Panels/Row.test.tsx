/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { DashboardRuntimeProvider, createDashboardRuntimeStore } from '../globalState';
import type { IPanel } from '../types';
import Row from './Row';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  useReplaceTemplateVariables: () => (value: string, params?: { scopedVars?: IPanel['scopedVars'] }) => {
    const region = params?.scopedVars?.region?.value;
    return region ? value.replace('$region', String(region)) : value;
  },
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

  const { container } = render(
    <DashboardRuntimeProvider store={store}>
      <Row isAuthorized name={row.name} row={row} onToggle={jest.fn()} onAddClick={jest.fn()} onPasteClick={jest.fn()} onEditClick={jest.fn()} onDeleteClick={jest.fn()} />
    </DashboardRuntimeProvider>,
  );

  expect(screen.getByText('Region: $region')).toBeInTheDocument();
  expect(container.querySelector('.dashboards-panels-item-drag-handle')).not.toBeInTheDocument();
});

function renderRow(overrides: Partial<IPanel> = {}) {
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variablesWithOptions', [{ name: 'region', definition: 'region', type: 'custom', datasource: { cate: 'prometheus' }, value: ['a', 'b'] }]);
  const row = {
    id: 'row',
    type: 'row',
    name: 'Region: $region',
    description: '',
    collapsed: true,
    panels: [],
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 },
    ...overrides,
  } satisfies IPanel;
  const callbacks = { onToggle: jest.fn(), onAddClick: jest.fn(), onPasteClick: jest.fn(), onEditClick: jest.fn(), onDeleteClick: jest.fn() };
  return {
    ...render(
      <DashboardRuntimeProvider store={store}>
        <Row isAuthorized name={row.name} row={row} {...callbacks} />
      </DashboardRuntimeProvider>,
    ),
    row,
    ...callbacks,
  };
}

test.each([false, true])('a repeated row hides actions and drag handles, uses scoped title and can toggle (collapsed=%s)', (collapsed) => {
  const { container, onToggle } = renderRow({ repeatPanelId: 'source', scopedVars: { region: { value: 'beijing' } }, collapsed });
  expect(screen.getByText('Region: beijing')).toBeInTheDocument();
  expect(screen.queryByText('add-panel')).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: 'setting' })).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: 'delete' })).not.toBeInTheDocument();
  expect(container.querySelector('.dashboards-panels-item-drag-handle')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Region: beijing'));
  expect(onToggle).toHaveBeenCalledTimes(1);
});

test('submits the repeat variable and resets temporary state when the settings dialog closes', () => {
  const { onEditClick, row } = renderRow();
  fireEvent.click(screen.getByRole('img', { name: 'setting' }));
  let dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Edited name' } });
  fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: 'row.repeat' }));
  fireEvent.click(screen.getByText('region', { selector: '.ant-select-item-option-content' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
  expect(onEditClick).toHaveBeenCalledWith({ ...row, name: 'Edited name', repeat: 'region' });

  fireEvent.click(screen.getByRole('img', { name: 'setting' }));
  dialog = screen.getByRole('dialog');
  expect(within(dialog).getByRole('textbox')).toHaveValue(row.name);
  expect(within(dialog).queryByText('region', { selector: '.ant-select-selection-item' })).not.toBeInTheDocument();
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Cancelled name' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('img', { name: 'setting' }));
  expect(within(screen.getByRole('dialog')).getByRole('textbox')).toHaveValue(row.name);
});

test('can clear an existing repeat variable and submit with Enter', () => {
  const { onEditClick, row } = renderRow({ repeat: 'region' });
  fireEvent.click(screen.getByRole('img', { name: 'setting' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.mouseDown(dialog.querySelector('.ant-select-clear')!);
  fireEvent.keyDown(within(dialog).getByRole('textbox'), { key: 'Enter', code: 'Enter', keyCode: 13, charCode: 13 });
  expect(onEditClick).toHaveBeenCalledWith({ ...row, repeat: undefined });
});

test('renders a drag handle for a collapsed row', () => {
  const store = createDashboardRuntimeStore();
  const row = {
    id: 'row-1',
    type: 'row',
    name: 'Collapsed row',
    description: '',
    collapsed: true,
    panels: [],
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: 'row-1', x: 0, y: 0, w: 24, h: 1 },
  } satisfies IPanel;

  const { container } = render(
    <DashboardRuntimeProvider store={store}>
      <Row isAuthorized name={row.name} row={row} onToggle={jest.fn()} onAddClick={jest.fn()} onPasteClick={jest.fn()} onEditClick={jest.fn()} onDeleteClick={jest.fn()} />
    </DashboardRuntimeProvider>,
  );

  expect(container.querySelector('.dashboards-panels-item-drag-handle')).toBeInTheDocument();
});
