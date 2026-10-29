/** @jest-environment jsdom */
jest.mock('@/utils', () => ({
  getDefaultDatasourceValue: jest.fn(),
  setDefaultDatasourceValue: jest.fn(),
}));
jest.mock('@/utils/constant', () => ({
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
}));
jest.mock('@/utils/momentLocale', () => ({}));
jest.mock('@/components/TimeRangePicker/config', () => ({ ...jest.requireActual('@/components/TimeRangePicker/config'), rangeOptions: [] }));
jest.mock('@/components/TimeRangePicker', () => ({
  getDefaultValue: jest.fn(),
  isValid: jest.requireActual('@/components/TimeRangePicker/utils').isValid,
}));

import moment from 'moment';
import { message } from 'antd';
import { getDefaultValue } from '@/components/TimeRangePicker';
import { getDatasourceValue, getDefaultTimeRange, getFullscreenDisplayOptions, isFullscreenExitDisabled } from './index';

describe('getDatasourceValue', () => {
  it('resolves v5 datasource names to IDs and leaves unknown names unresolved', () => {
    expect(getDatasourceValue({ version: '2.0.0', datasourceValue: 'prom-main' }, [{ id: 7, name: 'prom-main' }] as never)).toBe(7);
    expect(getDatasourceValue({ version: '2.0.0', datasourceValue: 'missing' }, [{ id: 7, name: 'prom-main' }] as never)).toBeUndefined();
  });
});

describe('getFullscreenDisplayOptions', () => {
  it('keeps the existing fullscreen defaults when no display parameters are provided', () => {
    expect(getFullscreenDisplayOptions({ viewMode: 'fullscreen' })).toEqual({
      isFullscreen: true,
      showHeader: false,
      showVariables: false,
      readonly: false,
      disableExit: false,
    });
  });

  it('enables each explicit fullscreen display parameter', () => {
    expect(
      getFullscreenDisplayOptions({
        viewMode: 'fullscreen',
        __show_header: 'true',
        __show_variables: 'true',
        __readonly: 'true',
        __disable_fullscreen_exit: 'true',
      }),
    ).toEqual({
      isFullscreen: true,
      showHeader: true,
      showVariables: true,
      readonly: true,
      disableExit: true,
    });
  });

  it('only accepts the exact string true and ignores the parameters outside fullscreen mode', () => {
    expect(
      getFullscreenDisplayOptions({
        viewMode: 'normal',
        __show_header: 'true',
        __show_variables: 'TRUE',
        __readonly: ['true'],
      }),
    ).toEqual({
      isFullscreen: false,
      showHeader: false,
      showVariables: false,
      readonly: false,
      disableExit: false,
    });
  });
});

describe('isFullscreenExitDisabled', () => {
  it('reads the exit setting before entering fullscreen', () => {
    expect(isFullscreenExitDisabled({ __disable_fullscreen_exit: 'true' })).toBe(true);
    expect(isFullscreenExitDisabled({ __disable_fullscreen_exit: ['true'] })).toBe(false);
  });
});

describe('getDefaultTimeRange', () => {
  const timestamp = '1793034000000';
  const absolute = '2026-10-27 01:00:00';
  let error: jest.SpyInstance;

  beforeEach(() => {
    error = jest.spyOn(message, 'error').mockReturnValue((() => {}) as any);
    (getDefaultValue as jest.Mock).mockImplementation((_key, fallback) => fallback);
  });
  afterEach(() => {
    error.mockRestore();
    jest.clearAllMocks();
  });

  it.each([
    [timestamp, 'now'],
    ['now-8h', timestamp],
    [timestamp, absolute],
    [absolute, timestamp],
    [timestamp, timestamp],
    [absolute, absolute],
    ['now-1h', 'now'],
  ])('restores %s and %s independently without a false invalid-range warning', (from, to) => {
    const range = getDefaultTimeRange(123, { __from: from, __to: to });
    for (const [key, raw] of [
      ['start', from],
      ['end', to],
    ] as const) {
      if (raw === timestamp) {
        expect(moment.isMoment(range[key])).toBe(true);
        expect(range[key].valueOf()).toBe(Number(timestamp));
      } else {
        expect(range[key]).toBe(raw);
      }
    }
    expect(error).not.toHaveBeenCalled();
    expect(getDefaultValue).not.toHaveBeenCalled();
  });

  it.each([
    ['not-a-date', 'now'],
    [timestamp, 'invalid'],
    [[timestamp, timestamp], 'now'],
    [timestamp, ['now', 'now']],
    ['   ', 'now'],
  ])('rejects invalid or repeated query values without silently coercing them', (from, to) => {
    expect(getDefaultTimeRange(123, { __from: from, __to: to })).toEqual({ start: 'now-1h', end: 'now' });
    expect(error).toHaveBeenCalledTimes(1);
  });
});
