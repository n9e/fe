/** @jest-environment jsdom */
jest.mock('@/utils', () => ({
  getDefaultDatasourceValue: jest.fn(),
  setDefaultDatasourceValue: jest.fn(),
}));
jest.mock('@/utils/constant', () => ({
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
}));
jest.mock('@/components/TimeRangePicker/config', () => ({ rangeOptions: [] }));
jest.mock('@/components/TimeRangePicker', () => ({
  getDefaultValue: jest.fn(),
  isValid: jest.fn(),
}));

import { getDatasourceValue, getFullscreenDisplayOptions, isFullscreenExitDisabled } from './index';

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
