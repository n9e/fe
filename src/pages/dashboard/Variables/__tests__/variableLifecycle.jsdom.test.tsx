/** @jest-environment jsdom */

import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

jest.mock('@/App', () => {
  const React = jest.requireActual('react');
  const datasourceList = [
    { id: 1, name: 'ds-a', plugin_type: 'gcm' },
    { id: 2, name: 'ds-b', plugin_type: 'gcm' },
  ];
  return {
    CommonStateContext: React.createContext({
      datasourceList,
      groupedDatasourceList: { gcm: datasourceList },
      datasourceCateOptions: [],
      darkMode: false,
    }),
  };
});
jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: { prometheus: 'prometheus', elasticsearch: 'elasticsearch', mysql: 'mysql', gcm: 'gcm' },
  IS_PLUS: true,
}));
jest.mock('@/components/TimeRangePicker', () => ({
  parseRange: () => ({ start: new Date('2026-01-01'), end: new Date('2026-01-02') }),
}));
jest.mock('@/pages/dashboard/utils', () => ({ getDefaultStepByTime: () => 60 }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en_US' } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));
// 只隔离外部查询与本用例无关的变量类型；保留真实的 Query / Datasource 组件与依赖管理。
jest.mock('../datasource', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../Variable/Constant', () => () => null);
jest.mock('../Variable/Custom', () => () => null);
jest.mock('../Variable/DatasourceIdentifier', () => () => null);
jest.mock('../Variable/HostIdent', () => () => null);
jest.mock('../Variable/Textbox', () => () => null);

import Main from '../Main';
import datasource from '../datasource';
import { getGlobalState, setGlobalState } from '../../globalState';
import type { IVariable } from '../types';

const queryMock = datasource as jest.MockedFunction<typeof datasource>;
const projects = [
  { label: 'Production', value: 'project-1' },
  { label: 'Development', value: 'project-2' },
];

const dbVariable = (partial: Partial<IVariable> = {}): IVariable => ({
  name: 'db',
  type: 'datasource',
  definition: 'gcm',
  datasource: { cate: 'gcm' },
  ...partial,
});

const queryVariable = (name: string, partial: Partial<IVariable> = {}): IVariable => ({
  name,
  type: 'query',
  definition: '',
  datasource: { cate: 'gcm', value: 1 },
  ...partial,
});

function mountRuntime(variables: IVariable[]) {
  act(() => setGlobalState('variablesWithOptions', variables));
  const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
  return render(
    <ConfigProvider virtual={false}>
      <Router history={history}>
        <Main variableValueFixed={undefined!} loading={false} />
      </Router>
    </ConfigProvider>,
  );
}

/** 模拟 EditModal 保存：整体替换 variablesWithOptions，组件不重新挂载。 */
async function saveVariables(next: (prev: IVariable[]) => IVariable[]) {
  await act(async () => {
    setGlobalState('variablesWithOptions', next(getGlobalState('variablesWithOptions')));
  });
}

async function selectOption(label: string, comboboxIndex = 0) {
  fireEvent.mouseDown(screen.getAllByRole('combobox')[comboboxIndex]);
  // rc-select 14 的 role=option 是只读辅助节点；点击真实选项内容触发选择。
  const option = await screen.findByText(label, { selector: '.ant-select-item-option-content' });
  await act(async () => {
    fireEvent.click(option);
  });
}

function state(name: string) {
  return getGlobalState('variablesWithOptions').find((item) => item.name === name)!;
}

beforeEach(() => {
  queryMock.mockReset();
  localStorage.clear();
  setGlobalState('variablesWithOptions', []);
  setGlobalState('dashboardMeta', { ...getGlobalState('dashboardMeta'), dashboardId: '42' });
  setGlobalState('range', { start: 'now-1h', end: 'now' });
});
afterEach(async () => {
  await act(async () => {
    await Promise.resolve();
  });
  cleanup();
});

test('新增的 query 变量把数据源指向 $db 时，保存后立即查询可选项', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([dbVariable()]);
  await waitFor(() => expect(state('db').value).toBe(1));

  await saveVariables((prev) => [...prev, queryVariable('project', { datasource: { cate: 'gcm', value: '${db}' } })]);

  await waitFor(() => expect(state('project').options).toEqual(projects));
  expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ datasourceValue: 1 }));
  expect(state('project').value).toBe('project-1');
});

test('新增的无依赖 query 变量，保存后同样立即查询可选项', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([dbVariable()]);
  await waitFor(() => expect(state('db').value).toBe(1));

  await saveVariables((prev) => [...prev, queryVariable('project')]);

  await waitFor(() => expect(state('project').options).toEqual(projects));
});

test('新增变量不会破坏已有变量对 $db 的依赖联动', async () => {
  queryMock.mockImplementation(async ({ datasourceValue }) => [{ label: `metric-of-${datasourceValue}`, value: `metric-${datasourceValue}` }]);
  mountRuntime([dbVariable(), queryVariable('metric', { datasource: { cate: 'gcm', value: '${db}' } })]);
  await waitFor(() => expect(state('metric').value).toBe('metric-1'));

  await saveVariables((prev) => [...prev, queryVariable('project')]);
  await waitFor(() => expect(state('project').options).toBeDefined());

  await selectOption('ds-b');

  await waitFor(() => expect(state('metric').value).toBe('metric-2'));
});

test('编辑已有 query 变量的配置后，其下游变量随之刷新', async () => {
  queryMock.mockImplementation(async ({ query }) => {
    if (query.project_id) return [{ label: `metric of ${query.project_id}`, value: `metric/${query.project_id}` }];
    return query.query === 'v2' ? [{ label: 'P2', value: 'project-2' }] : [{ label: 'P1', value: 'project-1' }];
  });
  mountRuntime([queryVariable('project', { definition: 'v1' }), queryVariable('metric', { query: { project_id: '${project}' } })]);
  await waitFor(() => expect(state('metric').value).toBe('metric/project-1'));

  await saveVariables((prev) => prev.map((item) => (item.name === 'project' ? { ...item, definition: 'v2' } : item)));

  await waitFor(() => expect(state('project').value).toBe('project-2'));
  await waitFor(() => expect(state('metric').value).toBe('metric/project-2'));
});

test('嵌套 query filters 中的变量引用会随上游选择更新并重新查询', async () => {
  queryMock.mockImplementation(async ({ query }) => {
    const filterValue = query.filters?.[0]?.value;
    return filterValue ? [{ label: `zone of ${filterValue}`, value: `zone/${filterValue}` }] : projects;
  });
  mountRuntime([queryVariable('project'), queryVariable('zone', { query: { filters: [{ key: 'project_id', value: '${project}' }] } })]);
  await waitFor(() => expect(state('zone').value).toBe('zone/project-1'));

  await selectOption('Development');

  await waitFor(() => expect(state('zone').value).toBe('zone/project-2'));
  expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ query: expect.objectContaining({ filters: [{ key: 'project_id', value: 'project-2' }] }) }));
});

// Detail 首次渲染时 globalState.range 仍是默认值，随后才被同步为仪表盘真实的时间范围，
// 此时变量尚未就绪。初始化执行本身就会使用最新的时间范围，不应再额外刷新一轮。
test('时间范围在变量就绪前变化时，每个变量只查询一次', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([]);

  await act(async () => {
    setGlobalState('range', { start: 'now-3h', end: 'now' });
  });
  await saveVariables(() => [dbVariable(), queryVariable('device', { datasource: { cate: 'gcm', value: '${db}' } })]);

  await waitFor(() => expect(state('device').options).toEqual(projects));
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('删除变量后其执行器不再被调度', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([queryVariable('project'), queryVariable('metric', { query: { project_id: '${project}' } })]);
  await waitFor(() => expect(state('metric').options).toEqual(projects));

  await saveVariables((prev) => prev.filter((item) => item.name !== 'metric'));
  await waitFor(() => expect(getGlobalState('variablesWithOptions')).toHaveLength(1));

  queryMock.mockClear();
  await act(async () => {
    setGlobalState('range', { start: 'now-2h', end: 'now' });
  });

  await waitFor(() => expect(queryMock).toHaveBeenCalledTimes(1));
});
