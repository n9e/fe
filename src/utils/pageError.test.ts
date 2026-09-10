/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import { AppError, normalizeError } from './appError';
import { canGoBackInApp, clearPageError, markInAppNavigation, reportPageError, usePageError } from './pageError';

function buildError(overrides: Partial<AppError> = {}): AppError {
  return {
    ...normalizeError({ status: 403, message: 'denied' }),
    ...overrides,
  };
}

describe('normalizeError', () => {
  it('reads the structured error object when the backend sends one', () => {
    const error = normalizeError({
      status: 403,
      message: 'denied',
      data: {
        error: {
          code: 'PERMISSION_DENIED',
          message: 'denied',
          resource: { type: 'dashboard', id: '1024', name: 'core dashboard' },
          required_perm: '/dashboards',
          owners: [{ username: 'root', nickname: 'Root' }],
        },
      },
    });

    expect(error.code).toBe('PERMISSION_DENIED');
    expect(error.resource).toEqual({ type: 'dashboard', id: '1024', name: 'core dashboard' });
    expect(error.requiredPerm).toBe('/dashboards');
    expect(error.owners).toEqual([{ username: 'root', nickname: 'Root' }]);
  });

  it('degrades to the status code when the backend sends nothing structured', () => {
    const error = normalizeError({ status: 403, message: 'denied', data: { err: 'denied' } });

    expect(error.code).toBe('PERMISSION_DENIED');
    expect(error.resource).toBeUndefined();
    expect(error.owners).toBeUndefined();
  });

  it('ignores a non-object error field instead of treating it as context', () => {
    const error = normalizeError({ status: 404, message: 'missing', data: { error: 'missing' } });

    expect(error.code).toBe('NOT_FOUND');
    expect(error.resource).toBeUndefined();
  });

  it('keeps the path the request was issued from', () => {
    const error = normalizeError({ status: 403, message: 'denied', path: '/dashboards/1024' });

    expect(error.path).toBe('/dashboards/1024');
  });
});

describe('page error channel', () => {
  beforeEach(() => {
    clearPageError();
  });

  it('keeps the first error so a burst of 403s does not overwrite each other', () => {
    const { result } = renderHook(() => usePageError());

    act(() => {
      reportPageError(buildError({ message: 'first' }));
      reportPageError(buildError({ message: 'second' }));
    });

    expect(result.current?.message).toBe('first');
  });

  it('accepts a new error once the previous one is cleared', () => {
    const { result } = renderHook(() => usePageError());

    act(() => {
      reportPageError(buildError({ message: 'first' }));
      clearPageError();
      reportPageError(buildError({ message: 'second' }));
    });

    expect(result.current?.message).toBe('second');
  });

  it('hands the already reported error to a component that subscribes later', () => {
    act(() => {
      reportPageError(buildError({ message: 'reported before mount' }));
    });

    const { result } = renderHook(() => usePageError());

    expect(result.current?.message).toBe('reported before mount');
  });

  it('clears back to nothing', () => {
    const { result } = renderHook(() => usePageError());

    act(() => {
      reportPageError(buildError());
      clearPageError();
    });

    expect(result.current).toBeNull();
  });
});

describe('canGoBackInApp', () => {
  it('is false on the first route and true only after navigating inside the app', () => {
    // 首个路由只是挂载，不算一次跳转，此时没有可退回的应用内页面
    markInAppNavigation();
    expect(canGoBackInApp()).toBe(false);

    markInAppNavigation();
    expect(canGoBackInApp()).toBe(true);
  });
});
