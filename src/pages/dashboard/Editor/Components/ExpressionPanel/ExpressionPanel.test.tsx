/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import zh_CN from '@/pages/dashboard/locale/zh_CN';

import ExpressionPanel from './index';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const locale = jest.requireActual('@/pages/dashboard/locale/zh_CN').default;
      return key.startsWith('query.expression_') ? locale.query[key.split('.')[1]] : key;
    },
  }),
}));

// @/utils/constant 顶层使用 import.meta.env，jest CJS 环境无法解析，按仓库既有约定 mock
jest.mock('@/utils/constant', () => ({
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
}));

interface MockExpressionTarget {
  refId?: string;
  expression?: string;
}

function renderPanel(expressionTargets: MockExpressionTarget[]) {
  const onFinish = jest.fn();
  const utils = render(
    <Form onFinish={onFinish}>
      <Form.List name='targets' initialValue={expressionTargets}>
        {(fields, { remove }) => fields.map((field) => <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />)}
      </Form.List>
      <button type='submit'>submit</button>
    </Form>,
  );
  return { onFinish, ...utils };
}

describe('dashboard expression panel component', () => {
  it('renders an expression editor with a generated RefID header', () => {
    renderPanel([{ expression: '' }]);
    expect(screen.getByPlaceholderText(zh_CN.query.expression_placeholder)).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows query reference syntax and all built-in variables in the expression tooltip', async () => {
    renderPanel([{ expression: '$A / ${__interval_ms}' }]);
    fireEvent.mouseEnter(screen.getAllByRole('img', { name: 'question-circle' })[0]);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('您通过 $<refId> 引用查询，即 $A、$B、$C 等。');
    expect(tooltip).toHaveTextContent('两个标量值的总和：$A + $B > 10');
    for (const line of zh_CN.query.expression_variables_tip.split('\n')) {
      expect(tooltip).toHaveTextContent(line);
    }
    expect(tooltip).not.toHaveTextContent('${refId}');
  });

  it('uses the configured RefID as the panel header', () => {
    renderPanel([{ refId: 'C', expression: '$A / 100' }]);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('requires an expression before submit', async () => {
    const { onFinish } = renderPanel([{ expression: '' }]);
    fireEvent.click(screen.getByText('submit'));
    await waitFor(() => {
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  it('submits once the expression is filled', async () => {
    const { onFinish } = renderPanel([{ expression: '' }]);
    fireEvent.change(screen.getByPlaceholderText(zh_CN.query.expression_placeholder), { target: { value: '$A / 100' } });
    fireEvent.click(screen.getByText('submit'));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalled();
    });
    expect(onFinish.mock.calls[0][0].targets[0]).toMatchObject({ expression: '$A / 100' });
  });

  it('removes a row when its delete button is clicked', async () => {
    renderPanel([{ expression: '$A / 100' }, { expression: '$A * 2' }]);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[0]);
    await waitFor(() => {
      expect(screen.queryByText('B')).not.toBeInTheDocument();
    });
  });

  it('only shows the delete button when more than one row exists', () => {
    renderPanel([{ expression: '$A / 100' }]);
    expect(screen.queryByRole('img', { name: 'delete' })).not.toBeInTheDocument();
  });
});
