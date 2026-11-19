/** @jest-environment jsdom */

import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';

import type { ITarget } from '@/pages/dashboard/types';

import Elasticsearch from './index';

jest.mock('@/utils/constant', () => ({
  IS_PLUS: true,
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'query.add_query_btn': '添加查询',
        'query.add_expression_btn': '添加表达式',
        'query.expression_placeholder': '表达式内容',
      }[key] ?? key),
  }),
}));

jest.mock('./QueryPanel', () => {
  const { Form, Input } = jest.requireActual('antd');
  return function MockQueryPanel({ field }: { field: { name: number } }) {
    return (
      <div data-testid='ordinary-query'>
        普通查询
        <Form.Item name={[field.name, 'query', 'sql']}>
          <Input aria-label={`SQL ${field.name}`} />
        </Form.Item>
      </div>
    );
  };
});

const sqlTarget = {
  refId: 'A',
  query: { syntax: 'sql', sql: 'SELECT count(*) FROM logs' },
} satisfies ITarget;

function renderEditor(targets: ITarget[]) {
  let form: FormInstance;
  function TestForm() {
    const [instance] = Form.useForm();
    form = instance;
    return (
      <Form form={instance} initialValues={{ targets }}>
        <Elasticsearch datasourceValue={1} />
      </Form>
    );
  }
  render(<TestForm />);
  return { getTargets: () => form.getFieldValue('targets') as ITarget[] };
}

describe('Elasticsearch dashboard query editor', () => {
  it('adds an expression alongside an existing SQL query and still adds ordinary queries', () => {
    const { getTargets } = renderEditor([sqlTarget]);

    fireEvent.click(screen.getByRole('button', { name: /添加表达式/ }));

    const expressionInput = screen.getByLabelText('Expression');
    expect(expressionInput).toHaveValue('');
    expect(screen.getAllByTestId('ordinary-query')).toHaveLength(1);
    expect(screen.getByLabelText('SQL 0')).toHaveValue(sqlTarget.query.sql);
    expect(getTargets()).toEqual([sqlTarget, { kind: 'expression', expression: '', refId: 'B' }]);

    fireEvent.change(expressionInput, { target: { value: '$A * 2' } });
    expect(getTargets()[1]).toMatchObject({ kind: 'expression', expression: '$A * 2', refId: 'B' });

    fireEvent.click(screen.getByRole('button', { name: /添加查询/ }));

    expect(screen.getAllByTestId('ordinary-query')).toHaveLength(2);
    expect(screen.getByLabelText('Expression')).toHaveValue('$A * 2');
    expect(getTargets()).toEqual([
      sqlTarget,
      { kind: 'expression', expression: '$A * 2', refId: 'B' },
      { query: { values: [{ func: 'count' }], date_field: '@timestamp' }, refId: 'C' },
    ]);
  });

  it.each([{ kind: 'expression' }, { __mode__: '__expr__' }])('opens an existing expression with marker %j', (marker) => {
    const target = { ...marker, refId: 'B', expression: '$A / 100' } as ITarget;
    const { getTargets } = renderEditor([sqlTarget, target]);

    expect(screen.getByLabelText('Expression')).toHaveValue('$A / 100');
    expect(screen.getAllByTestId('ordinary-query')).toHaveLength(1);
    expect(getTargets()).toEqual([sqlTarget, target]);
  });
});
