/** @jest-environment jsdom */

import React from 'react';
import { Form } from 'antd';
import { act, render, screen } from '@testing-library/react';

import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { ITarget } from '@/pages/dashboard/types';

import { QueryForm } from './SingleTargetQueryEditor';

jest.mock('../QueryBuilder', () => () => null);
jest.mock('../registry', () => ({
  getDashboardDatasourceDefinition: () => undefined,
}));
jest.mock(
  './SingleTargetQueryPanel',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children,
);
jest.mock('./TargetDatasourceSelect', () => () => null);
jest.mock('../../Components/Collapse/style.less', () => ({}));

function TypeAwareEditor() {
  const type = Form.useWatch('type');
  return <span data-testid='query-editor-type'>{type ?? 'missing'}</span>;
}

function SqlBuilderEditor() {
  const form = Form.useFormInstance();
  return (
    <>
      <Form.Item name={['targets', 0, 'query', 'syntax']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['targets', 0, 'query', 'sql']} hidden>
        <div />
      </Form.Item>
      <button
        onClick={() => {
          const currentTarget = form.getFieldValue(['targets', 0]);
          form.setFieldsValue({
            targets: [
              {
                ...currentTarget,
                query: {
                  ...currentTarget.query,
                  sql: 'SELECT 1',
                },
              },
            ],
          });
        }}
      >
        写入 SQL
      </button>
    </>
  );
}

describe('SingleTargetQueryEditor', () => {
  it('provides form values before rendering a datasource editor', () => {
    render(
      <QueryForm
        target={{
          refId: 'B',
          kind: 'query',
          datasource: { cate: 'doris', id: 2 },
          query: {},
        }}
        type='timeseries'
        range={{} as IRawTimeRange}
        datasourceValue={2}
        onChange={() => undefined}
        QueryEditor={TypeAwareEditor as typeof import('../QueryBuilder').default}
      />,
    );

    expect(screen.getByTestId('query-editor-type')).toHaveTextContent('timeseries');
  });

  it('syncs SQL written through form APIs back to the panel target', () => {
    const onChange = jest.fn();
    render(
      <QueryForm
        target={{
          refId: 'B',
          kind: 'query',
          datasource: { cate: 'elasticsearch', id: 2 },
          resultType: 'time_series',
          query: { syntax: 'sql' },
        }}
        type='timeseries'
        range={{} as IRawTimeRange}
        datasourceValue={2}
        onChange={onChange}
        QueryEditor={SqlBuilderEditor as typeof import('../QueryBuilder').default}
      />,
    );

    act(() => {
      screen.getByRole('button', { name: '写入 SQL' }).click();
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        refId: 'B',
        datasource: { cate: 'elasticsearch', id: 2 },
        resultType: 'time_series',
        query: { syntax: 'sql', sql: 'SELECT 1' },
      }),
    );
  });

  it('preserves outer target metadata while an inner form writes SQL', () => {
    function Harness() {
      const [target, setTarget] = React.useState<ITarget>({
        refId: 'B',
        kind: 'query' as const,
        datasource: { cate: 'elasticsearch', id: 2 },
        hide: false,
        query: { syntax: 'sql' },
      });
      return (
        <>
          <button onClick={() => setTarget((current) => ({ ...current, hide: true }))}>隐藏查询</button>
          <QueryForm
            target={target}
            type='timeseries'
            range={{} as IRawTimeRange}
            datasourceValue={2}
            onChange={setTarget}
            QueryEditor={SqlBuilderEditor as typeof import('../QueryBuilder').default}
          />
          <span data-testid='target-hidden'>{String(target.hide)}</span>
        </>
      );
    }

    render(<Harness />);
    act(() => {
      screen.getByRole('button', { name: '隐藏查询' }).click();
      screen.getByRole('button', { name: '写入 SQL' }).click();
    });

    expect(screen.getByTestId('target-hidden')).toHaveTextContent('true');
  });
});
