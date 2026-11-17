/** @jest-environment jsdom */
import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { buildSql } from '../../services';
import useDorisQueryWorkspace, { defaultBuilderValues } from '../useQueryWorkspace';
import Main from './index';

const onQueryEdit = jest.fn();
const executeQuery = jest.fn();

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ hideUsageDocs: true, darkMode: false }) }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/utils/constant', () => ({ SIZE: 8, DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@fc-components/monaco-editor', () => ({ SqlMonacoPreview: ({ value }) => <pre>{value}</pre> }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null, parseRange: (range) => range }));
jest.mock('../../services', () => ({ buildSql: jest.fn() }));
jest.mock('../components/MainMoreOperations', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/SQLFormatButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/QueryBuilder', () => ({
  __esModule: true,
  default: ({ form, onChange }) => (
    <Form form={form} component='div' initialValues={defaultBuilderValues} onValuesChange={onChange}>
      <Form.Item name='limit'>
        <InputNumber aria-label='builder limit' />
      </Form.Item>
    </Form>
  ),
}));
jest.mock('./Query', () => ({ __esModule: true, default: () => null }));
jest.mock('./SQL', () => ({ __esModule: true, default: () => null }));
jest.mock('./Query/QueryInput', () => ({ __esModule: true, default: () => null }));
jest.mock('./SQL/QueryInput', () => ({
  __esModule: true,
  default: require('react').forwardRef((_props, _ref) => (
    <Form.Item name={['query', 'sql']}>
      <Input aria-label='SQL' />
    </Form.Item>
  )),
}));

function Fixture() {
  const [form] = Form.useForm();
  const workspace = useDorisQueryWorkspace({ form, datasourceValue: 1, execute: async () => executeQuery(), onQueryEdit });
  return (
    <Form form={form} initialValues={{ query: { syntax: 'sql', database: 'db', table: 'logs', time_field: 'ts', sql: 'SELECT original', range: { start: 1000, end: 2000 } } }}>
      <Main
        tabKey='one'
        datasourceValue={1}
        indexData={[]}
        organizeFields={[]}
        setOrganizeFields={() => {}}
        executeQuery={executeQuery}
        handleValueFilter={() => {}}
        setStackByField={() => {}}
        setDefaultSearchField={() => {}}
        onQueryEdit={onQueryEdit}
        noticeBanner={<Input aria-label='assistant draft' defaultValue='keep this conversation' />}
        workspace={workspace}
      />
    </Form>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (buildSql as jest.Mock).mockResolvedValue({ sql: 'SELECT generated', mode: 'table', value_key: [], label_key: [] });
});

it('keeps the manual SQL and assistant conversation while switching to the inline builder and back', () => {
  const { container } = render(<Fixture />);
  const assist = screen.getByRole('switch', { name: 'query_workspace.assist' });
  expect(assist).not.toBeChecked();
  expect(screen.getByLabelText('SQL')).toBeVisible();
  expect(container.querySelector('[data-log-query-main]')).toBeInTheDocument();

  fireEvent.click(assist);
  expect(screen.getByLabelText('builder limit')).toBeVisible();
  expect(screen.getByLabelText('SQL')).not.toBeVisible();
  expect(screen.getByLabelText('assistant draft')).not.toBeVisible();
  expect(onQueryEdit).toHaveBeenCalled();

  fireEvent.click(assist);
  expect(screen.getByLabelText('SQL')).toHaveValue('SELECT original');
  expect(screen.getByLabelText('assistant draft')).toBeVisible();
  expect(screen.getByLabelText('assistant draft')).toHaveValue('keep this conversation');
  expect(buildSql).not.toHaveBeenCalled();
  expect(executeQuery).not.toHaveBeenCalled();
});

it('converts the inline form without querying, then continues editing the generated statement', async () => {
  render(<Fixture />);
  fireEvent.click(screen.getByRole('switch', { name: 'query_workspace.assist' }));
  fireEvent.change(screen.getByLabelText('builder limit'), { target: { value: '25' } });
  fireEvent.click(screen.getByRole('button', { name: /query_workspace.convert/ }));
  await waitFor(() => expect(screen.getByText('SELECT generated')).toBeVisible());
  expect(buildSql).toHaveBeenCalledWith(expect.objectContaining({ query: [expect.objectContaining({ limit: 25 })] }));
  expect(executeQuery).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: /query_workspace.continue/ }));
  expect(screen.getByLabelText('SQL')).toBeVisible();
  expect(screen.getByLabelText('SQL')).toHaveValue('SELECT generated');
  expect(screen.getByRole('switch', { name: 'query_workspace.assist' })).not.toBeChecked();
});
