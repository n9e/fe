/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { act, render, waitFor } from '@testing-library/react';

import Organize from './index';
import { setGlobalState } from '@/pages/dashboard/globalState';
import type { DashboardSeries } from '@/pages/dashboard/Renderer/datasource/types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }),
}));

jest.mock('@/App', () => {
  const ReactActual = require('react');
  return { CommonStateContext: ReactActual.createContext({}) };
});

// @/utils/constant 顶层使用 import.meta.env，jest CJS 环境无法解析，按仓库既有约定 mock
jest.mock('@/utils/constant', () => ({
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
}));

// array-move 为 ESM 包，ts-jest 无法直接转换，按仓库既有约定 mock
jest.mock('array-move', () => ({
  arrayMoveImmutable: (array: unknown[], fromIndex: number, toIndex: number) => {
    const next = [...array];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  },
}));

// DocumentDrawer 依赖 @uiw/react-md-editor（ESM），jest 下 mock 掉
jest.mock('@/components/DocumentDrawer', () => ({
  __esModule: true,
  default: () => null,
}));

const logSeries: DashboardSeries[] = [
  { id: 'B-log-1', refId: 'B', metric: { host: 'web-01', message: 'request completed', status: '200' }, data: [], mode: 'raw' },
  { id: 'B-log-2', refId: 'B', metric: { host: 'web-02', message: 'request failed', status: '500' }, data: [], mode: 'raw' },
];

function renderOrganize(options: Record<string, unknown>, onFormReady: (form: FormInstance) => void) {
  function Harness() {
    const [form] = Form.useForm();
    React.useEffect(() => {
      onFormReady(form);
    }, [form]);
    return (
      <Form form={form}>
        <Form.List name='transformationsNG' initialValue={[{ id: 'organize', options }]}>
          {(fields) =>
            fields.map((field) => {
              const { name, key, ...resetField } = field;
              return (
                <Form.Item key={key} {...resetField} name={[name, 'options']}>
                  <Organize
                    field={field}
                    onClose={() => {
                      /* noop */
                    }}
                  />
                </Form.Item>
              );
            })
          }
        </Form.List>
      </Form>
    );
  }
  return render(<Harness />);
}

describe('dashboard Organize 编辑器字段列表维护', () => {
  beforeEach(() => {
    setGlobalState('series', logSeries);
  });

  it('options.fields 为空时初始化为当前数据列', async () => {
    let form: FormInstance | undefined;
    renderOrganize({}, (f) => {
      form = f;
    });

    await waitFor(() => {
      expect(form?.getFieldValue(['transformationsNG', 0, 'options', 'fields'])).toEqual(['host', 'message', 'status']);
    });
  });

  it('不覆盖用户已保存的字段顺序（仅追加新列）', async () => {
    let form: FormInstance | undefined;
    const savedOrder = ['status', 'host', 'message'];
    renderOrganize({ fields: savedOrder, indexByName: { status: 0, host: 1, message: 2 } }, (f) => {
      form = f;
    });

    // 组件挂载后不应把 fields 重置为数据列顺序
    await waitFor(() => {
      expect(form?.getFieldValue(['transformationsNG', 0, 'options', 'fields'])).toEqual(['status', 'host', 'message']);
    });
  });

  it('数据源新增字段时追加到已保存字段之后', async () => {
    let form: FormInstance | undefined;
    renderOrganize({ fields: ['host', 'message'] }, (f) => {
      form = f;
    });

    await waitFor(() => {
      expect(form?.getFieldValue(['transformationsNG', 0, 'options', 'fields'])).toEqual(['host', 'message', 'status']);
    });
  });

  it('多帧数据（columns 为空）时不清空已保存的 fields', async () => {
    // 多帧场景下 useColumns 返回 error、columns 为 undefined
    setGlobalState('series', [
      { id: 'A-1', refId: 'A', metric: { a: '1' }, data: [[1710000000, 1]], mode: 'timeSeries', isExp: false },
      { id: 'B-1', refId: 'B', metric: { b: '2' }, data: [[1710000000, 2]], mode: 'timeSeries', isExp: false },
    ]);
    let form: FormInstance | undefined;
    const savedFields = ['a', 'b'];
    renderOrganize({ fields: savedFields }, (f) => {
      form = f;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(form?.getFieldValue(['transformationsNG', 0, 'options', 'fields'])).toEqual(['a', 'b']);
  });
});
