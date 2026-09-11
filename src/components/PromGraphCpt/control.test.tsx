/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PromGraph from './index';
import { getPromData } from './services';

jest.mock('./services', () => ({ getPromData: jest.fn() }));
jest.mock('@/utils/constant', () => ({ N9E_PATHNAME: 'n9e' }));
jest.mock(
  './components/Panel',
  () =>
    ({ children }: any) =>
      children,
);
jest.mock('./locale', () => ({}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ datasourceList: [] }) }));
jest.mock('@/pages/dashboard/Components/UnitPicker', () => () => null);
jest.mock('@/pages/alertRules/List/utils', () => ({ downloadFile: jest.fn() }));
jest.mock('@/pages/dashboard/Renderer/Renderer/Timeseries', () => (props: any) => <div data-testid='graph-data'>{JSON.stringify(props.series)}</div>);
jest.mock('@/pages/dashboard/Renderer/datasource/utils', () => ({ completeBreakpoints: (_step: number, values: any) => values }));
jest.mock('./components/GraphStandardOptions', () => () => null);
jest.mock('@/components/TimeRangePicker', () => ({
  __esModule: true,
  default: (props: any) => <button onClick={() => props.onChange({ start: 'now-2h', end: 'now' })}>change range</button>,
  parseRange: () => ({ start: new Date(0), end: new Date(100000) }),
}));
jest.mock('@/components/PromQLInput/BuiltinMetrics', () => () => null);
jest.mock('./components/MetricsExplorer', () => () => null);
jest.mock('@fc-components/monaco-editor', () => ({
  PromQLMonacoEditor: (props: any) => <input aria-label='query draft' value={props.value || ''} onChange={(event) => props.onChange(event.target.value)} onBlur={props.onBlur} />,
}));
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Table: ({ dataSource }: any) => <div>{JSON.stringify(dataSource)}</div>,
}));

const response = (name: string) => ({ resultType: 'vector', result: [{ metric: { __name__: name }, value: [1, '1'], values: [[1, '1']] }] });
let requests: Array<{ resolve: (value: any) => void; reject: (error: Error) => void }>;
beforeEach(() => {
  requests = [];
  (getPromData as jest.Mock).mockImplementation(() => new Promise((resolve, reject) => requests.push({ resolve, reject })));
});

it('captures unblurred edits and restores the draft, submitted expression and range without incrementing user revision', () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} promQL='up' controlRef={controlRef} />);
  fireEvent.change(screen.getByLabelText('query draft'), { target: { value: 'rate(up[5m])' } });
  expect(controlRef.current.snapshot().query).toBe('rate(up[5m])');
  expect(controlRef.current.snapshot().submitted).toBe('up');
  const revision = controlRef.current.revision();
  const snapshot = controlRef.current.snapshot();
  act(() => controlRef.current.fill('sum(up)', { start: 'now-6h', end: 'now' }));
  expect(controlRef.current.revision()).toBe(revision);
  act(() => controlRef.current.restore(snapshot));
  expect(controlRef.current.snapshot()).toEqual(snapshot);
});

it.each(['table', 'graph'] as const)('waits for the actual %s response and does not query an old expression during fill', async (defaultType) => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} promQL='up' defaultType={defaultType} controlRef={controlRef} />);
  await act(async () => requests[0].resolve(response('old')));
  act(() => controlRef.current.fill('sum(up)', { start: 'now-6h', end: 'now' }));
  expect(getPromData).toHaveBeenCalledTimes(1);
  let run: Promise<any>;
  act(() => {
    run = controlRef.current.run();
  });
  const settled = jest.fn();
  run!.then(settled);
  expect(settled).not.toHaveBeenCalled();
  expect((getPromData as jest.Mock).mock.calls[1][1].query).toBe('sum(up)');
  await act(async () => requests[1].resolve({ resultType: 'vector', result: [] }));
  await expect(run!).resolves.toMatchObject({ empty: true });
});

it('rejects failed queries instead of reporting success', async () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('bad');
    run = controlRef.current.run();
  });
  const rejection = expect(run!).rejects.toThrow('invalid expression');
  await act(async () => requests[0].reject(new Error('invalid expression')));
  await rejection;
});

it.each(['table', 'graph'] as const)('aborts %s runs and ignores late results after source changes', async (defaultType) => {
  const controlRef: any = { current: null };
  const view = render(<PromGraph datasourceValue={1} defaultType={defaultType} controlRef={controlRef} />);
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('up');
    run = controlRef.current.run();
  });
  const rejection = expect(run!).rejects.toMatchObject({ name: 'AbortError' });
  const revision = controlRef.current.revision();
  view.rerender(<PromGraph datasourceValue={2} defaultType={defaultType} controlRef={controlRef} />);
  await rejection;
  expect(controlRef.current.revision()).toBeGreaterThan(revision);
  await act(async () => requests[requests.length - 1].resolve(response('new_result')));
  await act(async () => requests[0].resolve(response('stale_result')));
  expect(screen.queryByText(/stale_result/)).toBeNull();
  expect(screen.getByText(/new_result/)).toBeTruthy();
});

it('settles a pending run when the component unmounts', async () => {
  const controlRef: any = { current: null };
  const view = render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('up');
    run = controlRef.current.run();
  });
  const rejection = expect(run!).rejects.toMatchObject({ name: 'AbortError' });
  view.unmount();
  await rejection;
});

it.each(['table', 'graph'] as const)('keeps previous %s results when an explicitly stopped request returns late', async (defaultType) => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} promQL='up' defaultType={defaultType} controlRef={controlRef} />);
  await act(async () => requests[0].resolve(response('previous_result')));
  const controller = new AbortController();
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('sum(up)');
    run = controlRef.current.run({ signal: controller.signal });
  });
  const rejection = expect(run!).rejects.toMatchObject({ name: 'AbortError' });
  act(() => controller.abort());
  await rejection;
  expect((getPromData as jest.Mock).mock.calls[1][2].aborted).toBe(true);
  await act(async () => requests[1].resolve(response('late_result')));
  expect(screen.queryByText(/late_result/)).toBeNull();
  expect(screen.getByText(/previous_result/)).toBeTruthy();
});

it('rejects the replaced run and resolves only the newest matching request', async () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  let first: Promise<any>;
  let second: Promise<any>;
  act(() => {
    controlRef.current.fill('up');
    first = controlRef.current.run();
  });
  const rejected = expect(first!).rejects.toMatchObject({ name: 'AbortError' });
  act(() => {
    controlRef.current.fill('sum(up)');
    second = controlRef.current.run();
  });
  await rejected;
  const completed = jest.fn();
  second!.then(completed);
  await act(async () => requests[0].resolve(response('replaced')));
  expect(completed).not.toHaveBeenCalled();
  await act(async () => requests[1].resolve(response('current')));
  await expect(second!).resolves.toMatchObject({ empty: false });
});

it('invalidates a running query when the user edits an unblurred draft', async () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('up');
    run = controlRef.current.run();
  });
  const revision = controlRef.current.revision();
  const rejected = expect(run!).rejects.toMatchObject({ name: 'AbortError' });
  fireEvent.change(screen.getByLabelText('query draft'), { target: { value: 'my_draft' } });
  await rejected;
  expect(controlRef.current.revision()).toBeGreaterThan(revision);
  expect(controlRef.current.snapshot().query).toBe('my_draft');
});

it('tracks time range and query mode changes as user revisions', () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} defaultType='graph' controlRef={controlRef} />);
  const original = controlRef.current.revision();
  fireEvent.click(screen.getByText('change range'));
  expect(controlRef.current.revision()).toBeGreaterThan(original);
  expect(controlRef.current.snapshot().range).toEqual({ start: 'now-2h', end: 'now' });
  const afterRange = controlRef.current.revision();
  fireEvent.click(screen.getByText('tab_table'));
  expect(controlRef.current.revision()).toBeGreaterThan(afterRange);
});

it('does not rerun the previous expression when the user starts typing after an AI query', async () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('up');
    run = controlRef.current.run();
  });
  await act(async () => requests[0].resolve(response('previous_result')));
  await run!;
  fireEvent.change(screen.getByLabelText('query draft'), { target: { value: 'sum(up)' } });
  expect(getPromData).toHaveBeenCalledTimes(1);
  fireEvent.blur(screen.getByLabelText('query draft'));
  expect(getPromData).toHaveBeenCalledTimes(2);
  expect((getPromData as jest.Mock).mock.calls[1][1].query).toBe('sum(up)');
});

it('clears failed query feedback when undo restores an empty draft', async () => {
  const controlRef: any = { current: null };
  render(<PromGraph datasourceValue={1} controlRef={controlRef} />);
  const snapshot = controlRef.current.snapshot();
  let run: Promise<any>;
  act(() => {
    controlRef.current.fill('bad');
    run = controlRef.current.run();
  });
  const rejected = expect(run!).rejects.toThrow('invalid expression');
  await act(async () => requests[0].reject(new Error('invalid expression')));
  await rejected;
  expect(screen.getByText(/invalid expression/)).toBeTruthy();
  act(() => controlRef.current.restore(snapshot));
  expect(screen.queryByText(/invalid expression/)).toBeNull();
  expect(screen.getByLabelText('query draft')).toHaveValue('');
});
