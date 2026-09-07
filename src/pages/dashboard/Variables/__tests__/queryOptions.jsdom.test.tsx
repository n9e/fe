/** @jest-environment jsdom */

import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ConfigProvider, Form, Input } from 'antd';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

jest.mock('@/App', () => {
  const React = jest.requireActual('react');
  return {
    CommonStateContext: React.createContext({
      datasourceList: [{ id: 1, name: 'test', plugin_type: 'gcm' }],
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
// 只隔离外部查询与无关编辑器；保留真实的 Form、Select、Modal、Table、状态和依赖管理。
jest.mock('../datasource', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/DatasourceSelect', () => ({ DatasourceSelectV3: () => null }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../EditModal/Querybuilder', () => ({
  __esModule: true,
  default: () => (
    <Form.Item name='definition' hidden>
      <Input />
    </Form.Item>
  ),
}));
jest.mock('../Variable/Constant', () => () => null);
jest.mock('../Variable/Custom', () => () => null);
jest.mock('../Variable/Datasource', () => () => null);
jest.mock('../Variable/DatasourceIdentifier', () => () => null);
jest.mock('../Variable/HostIdent', () => () => null);
jest.mock('../Variable/Textbox', () => () => null);

import Main from '../Main';
import QueryEditor from '../EditModal/Variable/Query';
import datasource from '../datasource';
import { getGlobalState, setGlobalState } from '../../globalState';
import replaceTemplateVariables from '../utils/replaceTemplateVariables';
import initializeVariablesValue from '../utils/initializeVariablesValue';
import type { IVariable } from '../types';
import processLegacyQueryOptions from '../../VariableConfig/processQueryOptions';
import LegacyDisplayItem from '../../VariableConfig/DisplayItem';
import type { IVariable as LegacyVariable } from '../../VariableConfig/definition';

const queryMock = datasource as jest.MockedFunction<typeof datasource>;
const projects = [
  { label: 'Production', value: 'project-1' },
  { label: 'Development', value: 'project-2' },
];
const projectVariable = (partial: Partial<IVariable> = {}): IVariable => ({
  name: 'project',
  type: 'query',
  definition: '',
  datasource: { cate: 'gcm', value: 1 },
  ...partial,
});

function mountRuntime(variables: IVariable[], fixed?: boolean) {
  act(() => setGlobalState('variablesWithOptions', variables));
  const history = createMemoryHistory({ initialEntries: ['/dashboard?keep=1'] });
  const view = render(
    <ConfigProvider virtual={false}>
      <Router history={history}>
        <Main variableValueFixed={fixed!} loading={false} />
      </Router>
    </ConfigProvider>,
  );
  return { ...view, history };
}

async function selectOption(label: string, index = 0) {
  fireEvent.mouseDown(screen.getAllByRole('combobox')[index]);
  // rc-select 14 的 role=option 是只读辅助节点；点击真实选项内容触发选择。
  const option = await screen.findByText(label, { selector: '.ant-select-item-option-content' });
  await act(async () => {
    fireEvent.click(option);
  });
}

function state(name = 'project') {
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
  // 让依赖链在卸载前完成当前微任务，避免异步更新泄漏到下一个用例。
  await act(async () => {
    await Promise.resolve();
  });
  cleanup();
});

test('query → real dropdown → selection → URL/cache → interpolation → reload', async () => {
  queryMock.mockResolvedValue(projects);
  const { history, unmount } = mountRuntime([projectVariable()]);
  await waitFor(() => expect(state().value).toBe('project-1'));
  expect(screen.getByText('Production')).toBeInTheDocument();
  await selectOption('Development');
  await waitFor(() => expect(history.location.search).toContain('project=project-2'));
  expect(history.location.search).toContain('keep=1');
  expect(localStorage.getItem('dashboard_v6_42_project')).toBe('project-2');
  expect(replaceTemplateVariables('project=${project}')).toBe('project=project-2');
  expect(state().options).toEqual(projects);
  unmount();
  const restored = initializeVariablesValue([projectVariable()], {}, { dashboardId: 42 }) as IVariable[];
  mountRuntime(restored);
  await waitFor(() => expect(screen.getByText('Development')).toBeInTheDocument());
  expect(state().value).toBe('project-2');
});

test('real dependency chain receives the project value, not its display label', async () => {
  queryMock.mockImplementation(async ({ query }) => (query.project_id ? [{ label: `Metric for ${query.project_id}`, value: `metric/${query.project_id}` }] : projects));
  mountRuntime([projectVariable(), projectVariable({ name: 'metric', query: { project_id: '${project}' } })]);
  await waitFor(() => expect(state('metric').value).toBe('metric/project-1'));
  await selectOption('Development');
  await waitFor(() => expect(state('metric').value).toBe('metric/project-2'));
  expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ query: expect.objectContaining({ project_id: 'project-2' }) }));
  expect(screen.getByText('Metric for project-2')).toBeInTheDocument();
});

test('multiple selection and All persist values and interpolate values only', async () => {
  queryMock.mockResolvedValue(projects);
  const { history } = mountRuntime([projectVariable({ multi: true, allOption: true, value: ['project-1'] })]);
  await waitFor(() => expect(state().options).toEqual(projects));
  await selectOption('Development');
  fireEvent.blur(screen.getByRole('combobox'));
  await waitFor(() => expect(state().value).toEqual(['project-1', 'project-2']));
  expect(localStorage.getItem('dashboard_v6_42_project')).toBe('["project-1","project-2"]');
  expect(history.location.search).toContain('project=project-1');
  expect(history.location.search).toContain('project=project-2');
  expect(replaceTemplateVariables('${project}')).toBe('project-1,project-2');
  await selectOption('All');
  fireEvent.blur(screen.getByRole('combobox'));
  await waitFor(() => expect(state().value).toEqual(['all']));
  expect(localStorage.getItem('dashboard_v6_42_project')).toBe('["all"]');
  expect(replaceTemplateVariables('${project}')).toBe('project-1,project-2');
});

test('refresh preserves selection when only label changes, and falls back when value disappears', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([projectVariable({ value: 'project-2' })]);
  await waitFor(() => expect(state().options).toEqual(projects));
  queryMock.mockResolvedValue([{ label: 'Renamed development', value: 'project-2' }]);
  act(() => setGlobalState('range', { start: 'now-2h', end: 'now' }));
  await waitFor(() => expect(screen.getByText('Renamed development')).toBeInTheDocument());
  expect(state().value).toBe('project-2');
  queryMock.mockResolvedValue([{ label: 'Replacement', value: 'project-3' }]);
  act(() => setGlobalState('range', { start: 'now-3h', end: 'now' }));
  await waitFor(() => expect(state().value).toBe('project-3'));
  expect(screen.getByText('Replacement')).toBeInTheDocument();
});

test('fixed URL values survive an absent option', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([projectVariable({ value: 'project-outside' })], true);
  await waitFor(() => expect(state().options).toEqual(projects));
  expect(state().value).toBe('project-outside');
  expect(replaceTemplateVariables('${project}')).toBe('project-outside');
});

test('query failure then recovery clears stale options and restores display labels', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([projectVariable({ value: 'project-2' })]);
  await waitFor(() => expect(state().options).toEqual(projects));
  queryMock.mockRejectedValue(new Error('query unavailable'));
  act(() => setGlobalState('range', { start: 'now-2h', end: 'now' }));
  await waitFor(() => expect(state().options).toEqual([]));
  expect(state().value).toBe('project-2');
  queryMock.mockResolvedValue(projects);
  act(() => setGlobalState('range', { start: 'now-3h', end: 'now' }));
  await waitFor(() => expect(screen.getByText('Development')).toBeInTheDocument());
  expect(state().options).toEqual(projects);
});

function EditorHarness({ variable }: { variable: IVariable }) {
  const [form] = Form.useForm();
  const footer = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);
  return (
    <>
      <div ref={footer} />
      <Form form={form} initialValues={variable}>
        <Form.Item name='name' hidden>
          <Input />
        </Form.Item>
        <Form.Item name={['datasource', 'value']} hidden>
          <Input />
        </Form.Item>
        {ready && <QueryEditor formatedReg={variable.reg || ''} datasourceVars={[]} variablesWithOptions={[]} footerExtraRef={footer} />}
      </Form>
    </>
  );
}

test.each([
  ['/project-/', projects],
  [
    '/project-(?<value>.*)/',
    [
      { label: 'Production', value: '1' },
      { label: 'Development', value: '2' },
    ],
  ],
] as const)('real editor preview and runtime agree for regex %s', async (reg, expected) => {
  queryMock.mockResolvedValue(projects);
  const variable = projectVariable({ reg });
  const view = render(
    <ConfigProvider virtual={false}>
      <EditorHarness variable={variable} />
    </ConfigProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.data_preview' }));
  const dialog = await screen.findByRole('dialog');
  await waitFor(() => expect(within(dialog).getByText('Development')).toBeInTheDocument());
  const rows = within(dialog)
    .getAllByRole('row')
    .filter((row) => row.hasAttribute('data-row-key'));
  expect(
    rows.map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ),
  ).toEqual(expected.map(({ label, value }) => [label, value]));
  expect(within(dialog).queryByText('[object Object]')).not.toBeInTheDocument();
  view.unmount();
  mountRuntime([variable]);
  await waitFor(() => expect(state().options).toEqual(expected));
  expect(state().value).toBe(expected[0].value);
});

test('legacy processing and real legacy dropdown preserve labels and emit actual values', async () => {
  const onChange = jest.fn();
  const options = processLegacyQueryOptions(projects, '/project-/');
  const expression = { ...projectVariable(), options } as LegacyVariable;
  render(
    <ConfigProvider virtual={false}>
      <LegacyDisplayItem expression={expression} value='project-1' onChange={onChange} />
    </ConfigProvider>,
  );
  expect(screen.getByText('Production')).toBeInTheDocument();
  await selectOption('Development');
  expect(onChange).toHaveBeenCalledWith('project-2');
});

test('preview failure can be retried and replaces the error with fresh label/value rows', async () => {
  queryMock.mockRejectedValueOnce(new Error('preview unavailable')).mockResolvedValue(projects);
  render(
    <ConfigProvider virtual={false}>
      <EditorHarness variable={projectVariable()} />
    </ConfigProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.data_preview' }));
  const dialog = await screen.findByRole('dialog');
  await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('preview unavailable'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.data_preview' }));
  await waitFor(() => expect(within(dialog).getByText('Development')).toBeInTheDocument());
  expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  expect(queryMock).toHaveBeenCalledTimes(2);
});

test('mixed results render numeric values as strings and HTML labels as text; clear removes persisted selection', async () => {
  queryMock.mockResolvedValue([{ label: 'Zero', value: 0 }, 'plain', { label: '<b>Production</b>', value: 'project-1' }]);
  const { history } = mountRuntime([projectVariable()]);
  await waitFor(() => expect(state().value).toBe('0'));
  expect(screen.getByText('Zero')).toBeInTheDocument();
  await selectOption('<b>Production</b>');
  await waitFor(() => expect(state().value).toBe('project-1'));
  expect(screen.getByText('<b>Production</b>', { selector: '.ant-select-selection-item' }).tagName).toBe('SPAN');
  expect(document.querySelector('.ant-select-selection-item b')).toBeNull();
  const clearIcon = document.querySelector('.ant-select-clear');
  expect(clearIcon).not.toBeNull();
  fireEvent.mouseDown(clearIcon!);
  await waitFor(() => expect(state().value).toBe(''));
  expect(history.location.search).not.toContain('project=');
  expect(localStorage.getItem('dashboard_v6_42_project')).toBe('');
});

test('a stale response cannot replace a newer option label/value set', async () => {
  queryMock.mockResolvedValue(projects);
  mountRuntime([projectVariable()]);
  await waitFor(() => expect(state().options).toEqual(projects));
  let resolveOld!: (value: typeof projects) => void;
  queryMock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  act(() => setGlobalState('range', { start: 'now-2h', end: 'now' }));
  await waitFor(() => expect(queryMock).toHaveBeenCalledTimes(2));
  const latest = [{ label: 'Latest', value: 'project-new' }];
  queryMock.mockResolvedValue(latest);
  act(() => setGlobalState('range', { start: 'now-3h', end: 'now' }));
  await waitFor(() => expect(state().options).toEqual(latest));
  await act(async () => {
    resolveOld([{ label: 'Stale', value: 'project-old' }]);
  });
  expect(state().options).toEqual(latest);
  expect(state().value).toBe('project-new');
  expect(screen.getByText('Latest')).toBeInTheDocument();
  expect(screen.queryByText('Stale')).not.toBeInTheDocument();
});

test('an empty result produces no default option and no synthetic object string', async () => {
  queryMock.mockResolvedValue([]);
  mountRuntime([projectVariable()]);
  await waitFor(() => expect(state().options).toEqual([]));
  expect(state().value).toBeUndefined();
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  expect(document.querySelectorAll('.ant-select-item-option')).toHaveLength(0);
});
