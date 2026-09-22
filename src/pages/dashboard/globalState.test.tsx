/** @jest-environment jsdom */

import React from 'react';
import { act, render, screen } from '@testing-library/react';

import * as globalState from './globalState';
import { DashboardRuntimeProvider, createDashboardRuntimeStore, useDashboardRuntimeStoreIfAvailable, useGlobalState } from './globalState';
import type { IVariable } from './Variables/types';

/** 构造最小可用的 textbox 变量，仅用于验证实例间的状态隔离。 */
const variable = (value: string): IVariable => ({
  name: value,
  value,
  definition: '',
  type: 'textbox',
  datasource: { cate: 'prometheus' },
});

/** 在测试中暴露实例变量值和更新入口，用于验证 Provider 之间不存在状态串扰。 */
function RuntimeProbe({ label }: { label: string }) {
  const [variables, setVariables] = useGlobalState('variablesWithOptions');

  return (
    <button type='button' aria-label={label} onClick={() => setVariables([variable(label)])}>
      {variables[0]?.value ?? 'empty'}
    </button>
  );
}

/** 暴露可选运行时是否存在，验证可复用图表能显式创建隔离容器而不回退单例。 */
function RuntimeAvailabilityProbe() {
  const store = useDashboardRuntimeStoreIfAvailable();

  return <span>{store ? 'available' : 'missing'}</span>;
}

/** 在 Provider 之外读取运行时，用于验证缺失 Provider 时直接抛错。 */
function BareRuntimeProbe() {
  useGlobalState('range');
  return null;
}

describe('DashboardRuntimeProvider', () => {
  it('does not expose a module-level runtime getter and requires a provider', () => {
    expect(globalState).not.toHaveProperty('getGlobalState');

    // 缺失 Provider 时必须直接抛错，而不是回退到任何共享状态
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BareRuntimeProbe />)).toThrow('Dashboard runtime state requires DashboardRuntimeProvider');
    consoleError.mockRestore();
  });

  it('allows external visualizations to detect a missing runtime provider without restoring a singleton', () => {
    const view = render(<RuntimeAvailabilityProbe />);
    expect(screen.getByText('missing')).toBeInTheDocument();

    view.rerender(
      <DashboardRuntimeProvider>
        <RuntimeAvailabilityProbe />
      </DashboardRuntimeProvider>,
    );
    expect(screen.getByText('available')).toBeInTheDocument();
  });

  it('keeps variables isolated between dashboard instances and after a sibling unmounts', () => {
    const firstStore = createDashboardRuntimeStore();
    const secondStore = createDashboardRuntimeStore();
    const view = render(
      <>
        <DashboardRuntimeProvider key='first' store={firstStore}>
          <RuntimeProbe label='first' />
        </DashboardRuntimeProvider>
        <DashboardRuntimeProvider key='second' store={secondStore}>
          <RuntimeProbe label='second' />
        </DashboardRuntimeProvider>
      </>,
    );

    act(() => screen.getByRole('button', { name: 'first' }).click());
    expect(firstStore.getGlobalState('variablesWithOptions')[0]?.value).toBe('first');
    expect(secondStore.getGlobalState('variablesWithOptions')).toEqual([]);

    view.rerender(
      <DashboardRuntimeProvider key='second' store={secondStore}>
        <RuntimeProbe label='second' />
      </DashboardRuntimeProvider>,
    );
    act(() => screen.getByRole('button', { name: 'second' }).click());
    expect(secondStore.getGlobalState('variablesWithOptions')[0]?.value).toBe('second');
  });
});
