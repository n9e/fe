/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Form, Input } from 'antd';

import QueryInputAddonAfter from './QueryInputAddonAfter';

jest.mock('../../constants', () => ({ NAME_SPACE: 'db_doris', NG_SQL_CACHE_KEY: 'history' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components/HistoricalRecords/ConditionHistoricalRecords', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/HistoricalRecords', () => ({
  __esModule: true,
  default: ({ onSelect }) => <button onClick={() => onSelect('SELECT history')}>history entry</button>,
}));

it('enters manual editing before applying and executing a SQL history entry', () => {
  const actions: string[] = [];
  function Host() {
    const [form] = Form.useForm();
    return (
      <Form form={form} initialValues={{ datasourceValue: 7, query: { syntax: 'sql', sql: 'original' } }}>
        <Form.Item name='datasourceValue' hidden>
          <Input />
        </Form.Item>
        <Form.Item name={['query', 'syntax']} hidden>
          <Input />
        </Form.Item>
        <Form.Item name={['query', 'sql']}>
          <Input aria-label='sql' />
        </Form.Item>
        <QueryInputAddonAfter onSelectSQL={() => actions.push('manual')} executeQuery={() => actions.push(form.getFieldValue(['query', 'sql']))} />
      </Form>
    );
  }
  render(<Host />);
  fireEvent.click(screen.getByRole('button', { name: 'history entry' }));
  expect(actions).toEqual(['manual', 'SELECT history']);
  expect(screen.getByLabelText('sql')).toHaveValue('SELECT history');
});
