/** @jest-environment jsdom */
import React, { useEffect } from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { Form, Input } from 'antd';

import type { QueryDockControl } from './useQueryDockActions';
import { useFormQueryControl, FormQuerySnapshot } from './useFormQueryControl';

const captured: { control?: () => QueryDockControl<FormQuerySnapshot> | null; onUserEdit?: (v?: string) => void; invalidate?: () => void; request?: unknown } = {};
const page = {
  commit: jest.fn(),
  refresh: jest.fn(),
  guard: undefined as ((statement: string) => string | undefined) | undefined,
  mode: 'sql' as 'sql' | 'query',
  // A panel whose own rules the guard already covers leaves `validate` out.
  checks: true,
};

function Host() {
  const [form] = Form.useForm();
  const bound = useFormQueryControl({
    form,
    datasourceValue: 7,
    paths: () => ({
      statement: page.mode === 'sql' ? ['query', 'sql'] : ['query', 'query'],
      range: ['query', 'range'],
      settings: { table: ['query', 'table'] },
      extra: { syntax: ['query', 'syntax'] },
    }),
    fillExtras: () => ({ query: { viz: 'table' } }),
    guard: (statement) => page.guard?.(statement),
    validate: page.checks ? () => form.validateFields() : undefined,
    commit: () => page.commit(),
    refresh: page.refresh,
    queryInput: () => document.body,
    queryButton: () => null,
  });
  useEffect(() => {
    captured.control = bound.getControl;
    captured.onUserEdit = bound.onUserEdit;
    captured.invalidate = bound.invalidate;
    captured.request = bound.queryRequest;
  });
  return (
    <Form form={form} initialValues={{ query: { syntax: page.mode, range: { start: 'now-1h', end: 'now' } } }}>
      <Form.Item name={['query', 'sql']}>
        <Input aria-label='sql' onChange={(event) => bound.onUserEdit(event.target.value)} />
      </Form.Item>
      <Form.Item name={['query', 'query']}>
        <Input aria-label='search' />
      </Form.Item>
      <Form.Item name={['query', 'table']}>
        <Input aria-label='table' />
      </Form.Item>
      <Form.Item name={['query', 'viz']} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={['query', 'syntax']} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={['query', 'range']} hidden>
        <Input />
      </Form.Item>
    </Form>
  );
}
const control = () => captured.control!()!;

beforeEach(() => {
  page.commit.mockReset();
  page.refresh.mockReset();
  page.guard = undefined;
  page.mode = 'sql';
  page.checks = true;
});

it('fills the statement, the window, the settings and the extras', () => {
  render(<Host />);
  act(() => control().fill('select 1', { start: 'now-6h', end: 'now' }, { table: 't' }));
  expect(screen.getByLabelText('sql')).toHaveValue('select 1');
  expect(screen.getByLabelText('table')).toHaveValue('t');
  expect(control().snapshot()).toEqual({ query: 'select 1', range: { start: 'now-6h', end: 'now' }, settings: { table: 't' }, extra: { syntax: 'sql' } });
});

it('runs through the page and resolves with what the fetch reports', async () => {
  render(<Host />);
  act(() => control().fill('select 1'));
  let run!: Promise<{ empty: boolean; count?: number }>;
  await act(async () => {
    run = control().run();
  });
  expect(page.commit).toHaveBeenCalled();
  const request = captured.request as { complete: (r: { empty: boolean; count?: number }) => void };
  act(() => request.complete({ empty: false, count: 4 }));
  await expect(run).resolves.toEqual({ empty: false, count: 4 });
});

it('sends the fetch before run returns when the page has no check of its own', async () => {
  page.checks = false;
  render(<Host />);
  act(() => control().fill('select 1'));
  let run!: Promise<{ empty: boolean; count?: number }>;
  act(() => {
    run = control().run();
  });
  // The request and the refresh reached the fetcher in one render, so a second
  // run started in the same tick cannot swallow this one.
  expect(page.commit).toHaveBeenCalled();
  const request = captured.request as { complete: (r: { empty: boolean; count?: number }) => void };
  act(() => request.complete({ empty: true, count: 0 }));
  await expect(run).resolves.toEqual({ empty: true, count: 0 });
});

it('refuses a run the page would reject, with the reason', async () => {
  render(<Host />);
  page.guard = (statement) => (statement.includes('$__time') ? undefined : 'bound the time');
  act(() => control().fill('select 1'));
  await expect(control().run()).rejects.toThrow('bound the time');
  expect(page.commit).not.toHaveBeenCalled();
});

it('counts the user editing as taking the panel back, never the assistant writing', () => {
  render(<Host />);
  const before = control().revision();
  act(() => control().fill('select 1'));
  expect(control().revision()).toBe(before);
  fireEvent.change(screen.getByLabelText('sql'), { target: { value: 'select 2' } });
  expect(control().revision()).toBe(before + 1);
});

it('follows the statement field the page currently uses', () => {
  render(<Host />);
  page.mode = 'query';
  act(() => control().fill('level:error'));
  expect(screen.getByLabelText('search')).toHaveValue('level:error');
  expect(screen.getByLabelText('sql')).toHaveValue('');
});

it('puts everything back on restore and runs again', () => {
  render(<Host />);
  act(() => control().fill('select 1', undefined, { table: 't1' }));
  const previous = control().snapshot();
  act(() => control().fill('select 2', undefined, { table: 't2' }));
  act(() => control().restore(previous));
  expect(screen.getByLabelText('sql')).toHaveValue('select 1');
  expect(screen.getByLabelText('table')).toHaveValue('t1');
  expect(page.refresh).toHaveBeenCalled();
});

it('empties on restore a setting the panel did not have before', () => {
  render(<Host />);
  const before = control().snapshot();
  act(() => control().fill('select 1', undefined, { table: 't' }));
  expect(screen.getByLabelText('table')).toHaveValue('t');
  act(() => control().restore(before));
  expect(screen.getByLabelText('table')).toHaveValue('');
});
