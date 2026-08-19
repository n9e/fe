/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen, waitFor } from '@testing-library/react';

import { OverrideHeader } from './index';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// @/utils/constant 顶层使用 import.meta.env，jest CJS 环境无法解析，按仓库既有约定 mock
jest.mock('@/utils/constant', () => ({
  SIZE: 8,
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  IS_ENT: false,
  IS_PLUS: false,
  N9E_PATHNAME: 'n9e',
  DatasourceCateEnum: {},
}));

function renderHeader(name: number, showIndex: boolean, overrides: Record<string, unknown>[]) {
  function Harness() {
    return (
      <Form>
        <Form.List name='overrides' initialValue={overrides}>
          {(fields) =>
            fields.map((field) => {
              const { key, ...restField } = field;
              return (
                <Form.Item key={key} {...restField} name={[field.name, 'matcher', 'id']} hidden>
                  <input type='hidden' />
                </Form.Item>
              );
            })
          }
        </Form.List>
        <OverrideHeader name={name} showIndex={showIndex} />
      </Form>
    );
  }
  return render(<Harness />);
}

describe('dashboard Overrides 标题栏匹配信息', () => {
  it('未配置 matcher value 时只显示 Override 标题', () => {
    renderHeader(0, false, [{ matcher: { id: 'byFrameRefID' } }]);
    expect(screen.getByText(/^Override$/)).toBeInTheDocument();
  });

  it('byName 匹配时显示字段名', async () => {
    renderHeader(0, false, [{ matcher: { id: 'byName', value: 'host' } }]);
    await waitFor(() => {
      // t 返回 key，因此文案为 i18n key + 值
      expect(screen.getByText(/panel\.overrides\.matcher\.byName\.option: host/)).toBeInTheDocument();
    });
  });

  it('byFrameRefID 匹配时显示查询条件名称', async () => {
    renderHeader(0, true, [{ matcher: { id: 'byFrameRefID', value: 'A' } }, { matcher: { id: 'byName', value: 'host' } }]);
    await waitFor(() => {
      expect(screen.getByText(/panel\.overrides\.matcher\.byFrameRefID\.option: A/)).toBeInTheDocument();
    });
  });
});
