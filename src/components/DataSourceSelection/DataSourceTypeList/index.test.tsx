/** @jest-environment jsdom */
import React from 'react';
import { ConfigProvider, Form, Radio } from 'antd';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DataSourceTypeList from './index';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
// Jest 使用 CJS 入口，与真实 Form、ConfigProvider 共用同一个 Context。
jest.mock('antd/es/config-provider/DisabledContext', () => jest.requireActual('antd/lib/config-provider/DisabledContext'));

const types = [
  { value: 'a', label: '类型 A' },
  { value: 'b', label: '类型 B' },
];

it('只在选择不同且未禁用的类型时触发回调，并保留受控选中项', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { rerender } = render(<DataSourceTypeList types={types} value='a' onChange={onChange} />);

  expect(screen.getByRole('radio', { name: /类型 A/ })).toHaveAttribute('aria-checked', 'true');
  await user.click(screen.getByRole('radio', { name: /类型 A/ }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole('radio', { name: '类型 B' }));
  expect(onChange).toHaveBeenCalledWith('b');
  expect(screen.getByRole('radio', { name: /类型 A/ })).toHaveAttribute('aria-checked', 'true');

  rerender(<DataSourceTypeList types={types} value='a' disabled onChange={onChange} />);
  await user.click(screen.getByRole('radio', { name: '类型 B' }));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it.each(['Form', 'ConfigProvider'] as const)('%s 禁用与 Radio.Button 一致，显式 false 不解除禁用，恢复后可切换', async (parent) => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const control = (parentDisabled: boolean, disabled?: boolean) => {
    const children = (
      <>
        <DataSourceTypeList types={types} value='a' disabled={disabled} onChange={onChange} />
        <Radio.Button disabled={disabled}>AntD 对照</Radio.Button>
      </>
    );
    return parent === 'Form' ? (
      <Form component={false} disabled={parentDisabled}>
        {children}
      </Form>
    ) : (
      <ConfigProvider componentDisabled={parentDisabled}>{children}</ConfigProvider>
    );
  };
  const { rerender } = render(control(true));

  for (const disabled of [undefined, false, true]) {
    rerender(control(true, disabled));
    expect(screen.getByRole('radio', { name: '类型 B' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'AntD 对照' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: '类型 B' }));
    expect(onChange).not.toHaveBeenCalled();
  }

  rerender(control(false, true));
  expect(screen.getByRole('radio', { name: '类型 B' })).toBeDisabled();
  await user.click(screen.getByRole('radio', { name: '类型 B' }));
  expect(onChange).not.toHaveBeenCalled();

  rerender(control(false, false));
  expect(screen.getByRole('radio', { name: '类型 B' })).toBeEnabled();
  expect(screen.getByRole('radio', { name: 'AntD 对照' })).toBeEnabled();
  await user.click(screen.getByRole('radio', { name: '类型 B' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('b');
});

it('隐藏标题时保留类型列表的可访问名称', () => {
  const onChange = jest.fn();
  const { rerender } = render(<DataSourceTypeList types={types} onChange={onChange} />);
  expect(screen.getByText('sourceType')).toBeInTheDocument();

  rerender(<DataSourceTypeList types={types} showLabel={false} onChange={onChange} />);
  expect(screen.queryByText('sourceType')).not.toBeInTheDocument();
  expect(screen.getByRole('radiogroup', { name: 'sourceType' })).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(2);
});
