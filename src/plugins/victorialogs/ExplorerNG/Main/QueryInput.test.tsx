/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, Input } from 'antd';

import QueryInput from './QueryInput';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('../../constants', () => ({ NAME_SPACE: 'victorialogs' }));
jest.mock('../components/QueryInputAddonAfter', () => () => null);

test.each([
  ['metric', ''],
  ['metric', '  '],
  ['raw', ''],
  ['raw', '  '],
] as const)('validates %s mode with query %j', async (mode, query) => {
  const onFinish = jest.fn();
  render(
    <Form initialValues={{ datasourceValue: 1, query: { mode, query: 'level:error' } }} onFinish={onFinish}>
      <Form.Item name='datasourceValue' hidden>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item name={['query', 'mode']} hidden>
        <Input type='hidden' />
      </Form.Item>
      <QueryInput executeQuery={jest.fn()} queryBuilderPinned={false} queryBuilderVisible={false} onLableClick={jest.fn()} />
      <button type='submit'>Run</button>
    </Form>,
  );

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: query } });
  fireEvent.blur(input);
  fireEvent.click(screen.getByRole('button', { name: 'Run' }));

  if (mode === 'metric') {
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ datasourceValue: 1, query: { mode, query } }));
  } else {
    expect(await screen.findByText('log_explorer:query_is_required')).toBeVisible();
    expect(onFinish).not.toHaveBeenCalled();
  }
});
