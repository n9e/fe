/// <reference types="jest" />

jest.mock('@/App', () => ({
  CommonStateContext: {},
}));

import { getSideMenuBgColor } from './index';

describe('getSideMenuBgColor', () => {
  it('uses the dark menu background variable for dark mode menus', () => {
    expect(getSideMenuBgColor('dark')).toBe('var(--fc-menu-dark-bg)');
  });
});
