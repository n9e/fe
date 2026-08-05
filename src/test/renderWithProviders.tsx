import React from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

import { CommonStateContext, ICommonState } from '@/App';

/**
 * 构造一个最小可用的 ICommonState，测试可按需覆盖。
 *
 * 注意：CommonStateContext 来自 @/App，而 App.tsx 顶层有 import.meta.env / location
 * 等副作用。使用本工具时，测试文件必须先 `jest.mock('@/App', ...)` 提供
 * CommonStateContext，否则加载真实 App 模块会失败。
 */
export function createMockCommonState(overrides: Partial<ICommonState> = {}): ICommonState {
  return {
    datasourceCateOptions: [],
    groupedDatasourceList: {},
    reloadGroupedDatasourceList: () => {},
    datasourceList: [],
    setDatasourceList: () => {},
    reloadDatasourceList: () => {},
    busiGroups: [],
    setBusiGroups: () => {},
    curBusiId: 0,
    setCurBusiId: () => {},
    businessGroup: {},
    setBusiGroup: () => {},
    getVaildBusinessGroup: () => {},
    businessGroupOnChange: () => {},
    profile: {},
    setProfile: () => {},
    licenseExpired: false,
    versions: { version: '', github_verison: '', newVersion: false },
    isPlus: false,
    sideMenuBgMode: 'dark',
    setSideMenuBgMode: () => {},
    darkMode: false,
    setDarkMode: () => {},
    esIndexMode: '',
    dashboardSaveMode: 'manual',
    installTs: 0,
    logsDefaultRange: { start: 'now-1h', end: 'now' },
    ...overrides,
  };
}

/** 返回一个包裹 CommonStateContext.Provider 的包装组件，可同时用于 render / renderHook */
export function createCommonStateWrapper(overrides: Partial<ICommonState> = {}) {
  const commonState = createMockCommonState(overrides);
  return ({ children }: { children: React.ReactNode }) => <CommonStateContext.Provider value={commonState}>{children}</CommonStateContext.Provider>;
}

interface RenderWithProvidersOptions {
  commonState?: Partial<ICommonState>;
}

export function renderWithProviders(ui: React.ReactElement, options: RenderWithProvidersOptions = {}): RenderResult {
  const Wrapper = createCommonStateWrapper(options.commonState);
  return render(ui, { wrapper: Wrapper });
}
