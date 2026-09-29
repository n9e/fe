/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

import Inspect from '.';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/components/CodeMirror', () => ({ value }: { value: string }) => <pre data-testid='code-mirror'>{value}</pre>);

const values = {
  id: 'panel',
  type: 'timeseries',
  name: 'Panel',
  description: '',
  layout: { h: 4, w: 12, x: 0, y: 0, i: 'panel' },
  targets: [],
  custom: {},
  options: {},
  overrides: [],
};

test('shows a client-side query error when there is no request snapshot', () => {
  const error = 'Query A references missing variable(s): instance';

  render(
    <Inspect
      error={error}
      requestReference={{
        request: {
          url: '/api/n9e/v2/query-batch',
          method: 'POST',
          data: { status: 'not_sent', reason: error, targets: values.targets },
        },
      }}
      values={values}
    />,
  );

  expect(screen.getByText(error)).toBeInTheDocument();
  expect(screen.getByTestId('code-mirror')).toHaveTextContent('not_sent');
  expect(screen.getByTestId('code-mirror')).toHaveTextContent('/api/n9e/v2/query-batch');
});

test('shows the request snapshot when an invoked query reports an error', () => {
  render(
    <Inspect
      error='network unavailable'
      query={[
        {
          type: 'Dashboard Query',
          request: {
            url: '/api/n9e/v2/query-batch',
            method: 'POST',
            data: { from: 1, to: 2, queries: [] },
          },
          response: { error: { message: 'network unavailable' } },
        },
      ]}
      values={values}
    />,
  );

  expect(screen.queryByText('network unavailable')).not.toBeInTheDocument();
  expect(screen.getByTestId('code-mirror')).toBeInTheDocument();
});
