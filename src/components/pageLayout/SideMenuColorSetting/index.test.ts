/// <reference types="jest" />

jest.mock('@/App', () => ({
  CommonStateContext: {},
}));

import { getSideMenuBgColor } from './index';
import { SIDE_MENU_COLORS } from './types';

describe('getSideMenuBgColor', () => {
  it('uses the dark menu background variable for dark mode menus', () => {
    expect(getSideMenuBgColor('dark')).toBe('var(--fc-menu-dark-bg)');
  });

  it('keeps the configurable sidebar colors scoped to the persisted sidebar modes', () => {
    expect(Object.keys(SIDE_MENU_COLORS)).toEqual(['light', 'dark', 'theme']);
  });
});
