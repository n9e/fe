/** @jest-environment jsdom */

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options ? `${key} ${Object.values(options).join(' ')}` : key),
    i18n: { language: 'en_US' },
  }),
}));
jest.mock('array-move', () => ({ arrayMoveImmutable: (items: unknown[]) => items }));
jest.mock('../EditModal/Variable', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ data, onOk, onCancel }: { data: { name: string }; onOk: (value: { name: string }) => void; onCancel: () => void }) =>
      React.createElement(
        'div',
        null,
        React.createElement('button', { type: 'button', onClick: () => onOk({ ...data, name: 'renamed' }) }, 'mock-save-rename'),
        React.createElement('button', { type: 'button', onClick: onCancel }, 'mock-cancel-edit'),
      ),
  };
});

import EditModal from '../EditModal';
import { createDashboardRuntimeStore, DashboardRuntimeProvider } from '../../globalState';
import { prepareVariableRename } from '../../Detail/utils/variableRename';
import type { IDashboardConfig, IPanel } from '../../types';
import type { IVariable } from '../types';

const createVariable = (name = 'original'): IVariable => ({
  name,
  type: 'textbox',
  definition: '',
  defaultValue: 'default',
  value: 'selected',
  datasource: { cate: 'prometheus' },
});

function renderEditModal({
  referenceCount = 0,
  search = '?keep=1&original=selected',
  onRenameImplementation,
}: {
  referenceCount?: number;
  search?: string;
  onRenameImplementation?: (oldName: string, newName: string, variables: IVariable[]) => void;
} = {}) {
  const store = createDashboardRuntimeStore();
  store.setGlobalState('variablesWithOptions', [createVariable()]);
  store.setGlobalState('dashboardMeta', { dashboardId: '42' } as never);

  const history = createMemoryHistory({ initialEntries: [`/dashboard${search}`] });
  const onChange = jest.fn();
  const onRename = jest.fn(onRenameImplementation);
  const setVisible = jest.fn();
  const view = render(
    <ConfigProvider virtual={false}>
      <DashboardRuntimeProvider store={store}>
        <Router history={history}>
          <EditModal visible setVisible={setVisible} onChange={onChange} onRename={onRename} getReferenceCount={() => referenceCount} />
        </Router>
      </DashboardRuntimeProvider>
    </ConfigProvider>,
  );

  return { ...view, history, onChange, onRename, setVisible, store };
}

async function openVariableEditor() {
  fireEvent.click(await screen.findByText('original'));
  fireEvent.click(await screen.findByRole('button', { name: 'mock-save-rename' }));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

test('有引用时改名会先让用户选择是否更新引用', async () => {
  const { onChange, onRename, store } = renderEditModal({ referenceCount: 2 });

  await openVariableEditor();

  expect(await screen.findByText('var.rename_reference_content original renamed 2')).toBeInTheDocument();
  expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['original']);
  expect(onChange).not.toHaveBeenCalled();
  expect(onRename).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'var.rename_reference_update 2' }));

  await waitFor(() => expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['renamed']));
  expect(onRename).toHaveBeenCalledWith('original', 'renamed', [expect.objectContaining({ name: 'renamed' })]);
  expect(onChange).not.toHaveBeenCalled();
});

test('选择更新引用后，改写后的面板配置可直接用于渲染', async () => {
  const config: IDashboardConfig = {
    version: '4.1.0',
    links: [],
    graphTooltip: 'default',
    graphZoom: 'default',
    var: [{ name: 'original', definition: '' }],
    panels: [
      {
        id: 'panel-1',
        name: 'Panel',
        description: '',
        type: 'timeseries',
        targets: [{ refId: 'A', expr: 'metric{host="$original"}' }],
        options: {},
        custom: {},
        overrides: [],
        layout: { i: 'panel-1', x: 0, y: 0, w: 12, h: 4 },
      },
    ],
  };
  let renderedPanels: IPanel[] | undefined;
  const { onRename } = renderEditModal({
    referenceCount: 1,
    onRenameImplementation: (oldName, newName, variables) => {
      renderedPanels = prepareVariableRename(config, oldName, newName, variables).panels;
    },
  });

  await openVariableEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'var.rename_reference_update 1' }));

  await waitFor(() => expect(renderedPanels?.[0].targets?.[0].expr).toBe('metric{host="$renamed"}'));
  expect(onRename).toHaveBeenCalledWith('original', 'renamed', [expect.objectContaining({ name: 'renamed' })]);
});

test('选择仅改名时保留引用配置，并通过普通变量变更回调保存', async () => {
  const { onChange, onRename, store } = renderEditModal({ referenceCount: 1 });

  await openVariableEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'var.rename_reference_only' }));

  await waitFor(() => expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['renamed']));
  expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'renamed' })]);
  expect(onRename).not.toHaveBeenCalled();
});

test('返回编辑会关闭选择框且不提交改名', async () => {
  const { onChange, onRename, store } = renderEditModal({ referenceCount: 1 });

  await openVariableEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'var.rename_reference_back' }));

  await waitFor(() => expect(screen.queryByText(/^var\.rename_reference_content/)).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'mock-save-rename' })).toBeInTheDocument();
  expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['original']);
  expect(onChange).not.toHaveBeenCalled();
  expect(onRename).not.toHaveBeenCalled();
});

test('没有引用时直接改名，不显示选择框', async () => {
  const { onChange, onRename, store } = renderEditModal({ referenceCount: 0 });

  await openVariableEditor();

  await waitFor(() => expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['renamed']));
  expect(screen.queryByText(/^var\.rename_reference_content/)).not.toBeInTheDocument();
  expect(onRename).toHaveBeenCalledWith('original', 'renamed', [expect.objectContaining({ name: 'renamed' })]);
  expect(onChange).not.toHaveBeenCalled();
});

test('删除有引用的变量时取消会保留变量、URL 和本地值', async () => {
  const { history, store } = renderEditModal({ referenceCount: 1 });
  localStorage.setItem('dashboard_v6_42_original', 'selected');
  const deleteIcon = document.querySelector('.anticon-delete');

  expect(deleteIcon).not.toBeNull();
  fireEvent.click(deleteIcon!.closest('button')!);
  expect(await screen.findByText('var.reference_delete_title original')).toBeInTheDocument();
  expect(screen.getByText('var.reference_delete_content 1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.cancel' }));

  await waitFor(() => expect(screen.queryByText(/^var\.reference_delete_title/)).not.toBeInTheDocument());
  expect(store.getGlobalState('variablesWithOptions').map((item) => item.name)).toEqual(['original']);
  expect(history.location.search).toBe('?keep=1&original=selected');
  expect(localStorage.getItem('dashboard_v6_42_original')).toBe('selected');
});

test('确认删除被引用的变量会删除定义并清理 URL 和本地值', async () => {
  const { history, onChange, store } = renderEditModal({ referenceCount: 1 });
  localStorage.setItem('dashboard_v6_42_original', 'selected');
  const deleteIcon = document.querySelector('.anticon-delete');

  fireEvent.click(deleteIcon!.closest('button')!);
  fireEvent.click(await screen.findByRole('button', { name: 'var.reference_delete_confirm' }));

  await waitFor(() => expect(store.getGlobalState('variablesWithOptions')).toEqual([]));
  expect(onChange).toHaveBeenCalledWith([]);
  expect(history.location.search).toBe('?keep=1');
  expect(localStorage.getItem('dashboard_v6_42_original')).toBeNull();
});

test('没有引用时直接删除变量', async () => {
  const { onChange, store } = renderEditModal({ referenceCount: 0 });
  const deleteIcon = document.querySelector('.anticon-delete');

  fireEvent.click(deleteIcon!.closest('button')!);

  await waitFor(() => expect(store.getGlobalState('variablesWithOptions')).toEqual([]));
  expect(screen.queryByText(/^var\.reference_delete_title/)).not.toBeInTheDocument();
  expect(onChange).toHaveBeenCalledWith([]);
});
