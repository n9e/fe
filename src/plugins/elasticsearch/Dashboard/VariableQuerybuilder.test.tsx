/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh-CN' } }) }));
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({ darkMode: false, datasourceList: [] }) }));
jest.mock('@/components/DocumentDrawer', () => () => null);
// 插值工具只用到 parseRange；真实 TimeRangePicker 会引入 rc-picker 的 ESM 产物
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range: unknown) => range }));
// @/utils/constant 在源码里使用 import.meta，node 测试环境无法解析
jest.mock('@/utils/constant', () => ({
  IS_PLUS: false,
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
  SIZE: 8,
  FONT_FAMILY: '',
  DatasourceCateEnum: {
    prometheus: 'prometheus',
    elasticsearch: 'elasticsearch',
    opensearch: 'opensearch',
    ck: 'ck',
    mysql: 'mysql',
    pgsql: 'pgsql',
    doris: 'doris',
  },
}));
jest.mock('@/pages/dashboard/Editor/QueryEditor/Elasticsearch/IndexSelect', () => ({
  __esModule: true,
  default: ({ datasourceValue }: { datasourceValue?: number }) => require('react').createElement('div', { 'data-testid': 'index-select' }, String(datasourceValue)),
}));
jest.mock('@/pages/explorer/Elasticsearch/services', () => ({ getFullFields: jest.fn().mockResolvedValue({ fields: [] }) }));

import { getFullFields } from '@/pages/explorer/Elasticsearch/services';
import type { IVariable } from '@/pages/dashboard/Variables/types';

import VariableQuerybuilder from './VariableQuerybuilder';

const getFullFieldsMock = getFullFields as jest.Mock;

/** 用 setFieldsValue 而不是 Form.initialValues 填充表单（编辑器目录的表单初始化约定）。 */
function Harness({ variables }: { variables?: IVariable[] }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({
      datasource: { cate: 'elasticsearch', value: '${datasource}' },
      definition: 'index',
      config: { index: 'logs-*' },
    });
  }, [form]);

  return (
    <Form form={form}>
      {/* 注册字段，贴近外层变量表单的真实结构；值仍由 setFieldsValue 在挂载后写入 */}
      <Form.Item name={['datasource', 'cate']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['datasource', 'value']} hidden>
        <div />
      </Form.Item>
      <Form.Item name='definition' hidden>
        <div />
      </Form.Item>
      <Form.Item name={['config', 'index']} hidden>
        <div />
      </Form.Item>
      <VariableQuerybuilder variables={variables} />
    </Form>
  );
}

describe('elasticsearch variable query builder', () => {
  beforeEach(() => {
    getFullFieldsMock.mockClear();
  });

  it('resolves a datasource variable before loading index fields', async () => {
    const variables = [{ name: 'datasource', type: 'datasource', value: '3', options: [] }] as unknown as IVariable[];

    render(<Harness variables={variables} />);

    await waitFor(() => expect(screen.getByTestId('index-select')).toHaveTextContent('3'));
    await waitFor(() => expect(getFullFieldsMock).toHaveBeenCalledWith(3, 'logs-*', { type: 'date' }));
  });

  it('cannot resolve a datasource variable when the runtime variables are not passed', async () => {
    render(<Harness />);

    // 未传 variables 时无法解析 `${datasource}`，不应发出字段请求（而非拿 undefined 去请求）
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(getFullFieldsMock).not.toHaveBeenCalled();
  });
});
