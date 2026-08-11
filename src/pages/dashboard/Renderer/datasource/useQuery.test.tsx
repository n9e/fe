/** @jest-environment jsdom */
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import moment from 'moment';

import { createCommonStateWrapper } from '@/test/renderWithProviders';
import { resetDashboardGlobalState } from '@/test/resetGlobalState';
import { createMockQueryResponse, createMockTarget, createMockTimeSeriesResult } from '@/test/fixtures/dashboardQuery';

import type { DashboardQueryResponse } from './types';
import useQuery from './useQuery';
import { fetchDashboardQuery } from './service';

jest.mock('@/App', () => {
  const React = require('react');
  return {
    CommonStateContext: React.createContext({}),
  };
});

// @/utils/constant 顶层使用 import.meta.env，jest CJS 环境无法解析，按仓库既有约定 mock
jest.mock('@/utils/constant', () => ({
  N9E_PATHNAME: 'n9e',
}));

jest.mock('./service', () => ({
  fetchDashboardQuery: jest.fn(),
}));

// contract 内部依赖 mock，保证请求构造确定性
jest.mock('./queryStep', () => ({
  getDashboardQueryStep: () => 30,
}));
jest.mock('@/components/TimeRangePicker/utils', () => ({
  parseRange: (range: { start: unknown; end: unknown }) => range,
}));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  replaceDatasourceVariables: (value: number | string) => value,
}));

const fetchDashboardQueryMock = fetchDashboardQuery as unknown as jest.Mock;
type UseQueryProps = Parameters<typeof useQuery>[0];

const time = {
  start: moment('2026-07-24T00:00:00.000Z'),
  end: moment('2026-07-24T01:00:00.000Z'),
};

const baseProps: UseQueryProps = {
  time,
  inViewPort: true,
  datasourceCate: 'prometheus',
  datasourceValue: 1,
  custom: {},
  targets: [],
};

const wrapper = createCommonStateWrapper({ datasourceList: [] });

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

const renderUseQuery = (props: Partial<UseQueryProps> = {}) => {
  const mergedProps = { ...baseProps, ...props } as UseQueryProps;
  return renderHook((p: UseQueryProps) => useQuery(p), { initialProps: mergedProps, wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  resetDashboardGlobalState();
});

describe('dashboard useQuery', () => {
  it('debounces the query and exposes normalized series', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const { result } = renderUseQuery({ targets: [createMockTarget()] });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });

      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      const requestData = fetchDashboardQueryMock.mock.calls[0][0];
      expect(requestData.queries).toHaveLength(1);
      expect(requestData.queries[0].ref_id).toBe('A');
      expect(result.current.loading).toBe(false);
      expect(result.current.loaded).toBe(true);
      expect(result.current.series).toHaveLength(1);
      expect(result.current.series[0]).toMatchObject({
        refId: 'A',
        mode: 'timeSeries',
        metric: { instance: 'localhost:9090' },
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('coalesces rapid target changes into a single request', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const { rerender } = renderUseQuery({ targets: [createMockTarget()] });

      await act(async () => {
        jest.advanceTimersByTime(100);
        await flushPromises();
      });
      // 防抖窗口内再次变化，不应发出请求
      rerender({ ...baseProps, targets: [createMockTarget({ expr: 'up{job="b"}' })] });
      await act(async () => {
        jest.advanceTimersByTime(100);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).not.toHaveBeenCalled();

      // 窗口结束后只发出一次请求
      await act(async () => {
        jest.advanceTimersByTime(500);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('surfaces ref-level errors from the response', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue({
        results: [
          {
            ref_id: 'A',
            status: 'error',
            error: { code: 'QUERY_FAILED', message: 'boom', retryable: true },
          },
        ],
      });
      const { result } = renderUseQuery({ targets: [createMockTarget()] });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });

      expect(result.current.error).toContain('boom');
      expect(result.current.errorsByRef.A).toMatchObject({ code: 'QUERY_FAILED' });
      expect(result.current.series).toEqual([]);
      expect(result.current.loaded).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('captures transport errors', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockRejectedValue(new Error('network down'));
      const { result } = renderUseQuery({ targets: [createMockTarget()] });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });

      expect(result.current.error).toBe('network down');
      expect(result.current.series).toEqual([]);
      expect(result.current.loaded).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not fire a request without targets', async () => {
    jest.useFakeTimers();
    try {
      const { result } = renderUseQuery({ targets: [] });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });

      expect(fetchDashboardQueryMock).not.toHaveBeenCalled();
      expect(result.current.loaded).toBe(true);
      expect(result.current.series).toEqual([]);
    } finally {
      jest.useRealTimers();
    }
  });

  it('defers the request while the panel is out of viewport', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const { rerender, result } = renderUseQuery({ targets: [createMockTarget()], inViewPort: false });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).not.toHaveBeenCalled();

      rerender({ ...baseProps, targets: [createMockTarget()], inViewPort: true });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });

      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(result.current.loaded).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not re-request a loaded panel when it scrolls back into viewport', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const { rerender, result } = renderUseQuery({ targets: [createMockTarget()] });

      // 首次进入视口 → 加载成功
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(result.current.loaded).toBe(true);

      // 滚出视口
      rerender({ ...baseProps, targets: [createMockTarget()], inViewPort: false });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);

      // 滚回视口：查询参数未变化，已加载的面板不应再触发请求
      rerender({ ...baseProps, targets: [createMockTarget()], inViewPort: true });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
      expect(result.current.loaded).toBe(true);
      expect(result.current.series).toHaveLength(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('refetches when query parameters changed while panel was out of viewport', async () => {
    jest.useFakeTimers();
    try {
      fetchDashboardQueryMock.mockResolvedValue(createMockQueryResponse());
      const { rerender } = renderUseQuery({ targets: [createMockTarget()] });

      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);

      // 滚出视口
      rerender({ ...baseProps, targets: [createMockTarget()], inViewPort: false });

      // 视口外修改查询参数
      rerender({ ...baseProps, targets: [createMockTarget({ expr: 'up{job="b"}' })], inViewPort: false });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);

      // 滚回视口：查询参数已变化 → 应重新请求
      rerender({ ...baseProps, targets: [createMockTarget({ expr: 'up{job="b"}' })], inViewPort: true });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('drops stale responses that resolve out of order', async () => {
    jest.useFakeTimers();
    try {
      const resolvers: Array<(value: DashboardQueryResponse) => void> = [];
      fetchDashboardQueryMock.mockImplementation(
        () =>
          new Promise<DashboardQueryResponse>((resolve) => {
            resolvers.push(resolve);
          }),
      );

      const { rerender, result } = renderUseQuery({ targets: [createMockTarget()] });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(resolvers).toHaveLength(1);

      // 切换 targets 触发第二次请求
      rerender({ ...baseProps, targets: [createMockTarget({ expr: 'up{job="b"}' })] });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(resolvers).toHaveLength(2);

      // 第二次请求先返回 → 生效
      await act(async () => {
        resolvers[1](createMockQueryResponse([createMockTimeSeriesResult({ series: [{ labels: { job: 'b' }, samples: [[1, 1]] }] })]));
        await flushPromises();
      });
      expect(result.current.series[0].metric).toEqual({ job: 'b' });

      // 第一次请求后返回 → 应为过期响应被丢弃
      await act(async () => {
        resolvers[0](createMockQueryResponse([createMockTimeSeriesResult({ series: [{ labels: { job: 'a' }, samples: [[1, 1]] }] })]));
        await flushPromises();
      });
      expect(result.current.series[0].metric).toEqual({ job: 'b' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('ignores responses after unmount', async () => {
    jest.useFakeTimers();
    try {
      let resolveLater!: (value: DashboardQueryResponse) => void;
      fetchDashboardQueryMock.mockImplementation(
        () =>
          new Promise<DashboardQueryResponse>((resolve) => {
            resolveLater = resolve;
          }),
      );

      const { unmount } = renderUseQuery({ targets: [createMockTarget()] });
      await act(async () => {
        jest.advanceTimersByTime(600);
        await flushPromises();
      });
      expect(resolveLater).toBeDefined();

      unmount();
      await act(async () => {
        resolveLater(createMockQueryResponse());
        await flushPromises();
      });
      // 卸载后不应再触发 setState，走到这里即代表无异常
      expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
