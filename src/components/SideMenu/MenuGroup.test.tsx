/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// MenuList's module graph reaches `import.meta` (ESM-only), which ts-jest cannot parse.
jest.mock('@/components/IconFont', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ type }: { type: string }) => React.createElement('span', { 'data-icon-type': type }),
  };
});
jest.mock('@/utils/constant', () => ({ __esModule: true, IS_PLUS: false, IS_ENT: false, N9E_PATHNAME: 'n9e' }));
jest.mock('react-i18next', () => ({ __esModule: true, useTranslation: () => ({ t: (key: string) => key }) }));
// antd/es and lucide-react ship untranspiled ESM, which jest does not transform inside node_modules.
jest.mock('antd/es/_util/placements', () => ({ __esModule: true, default: () => ({ rightTop: {} }) }));
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    __esModule: true,
    House: () => React.createElement('span', { 'data-icon-type': 'house' }),
    Sparkles: () => React.createElement('span', { 'data-icon-type': 'sparkles' }),
  };
});

import MenuList, { getSideMenuIconColorClass, MenuGroup } from './MenuList';
import { IMenuItem } from './types';

const baseProps = {
  sideMenuBgColor: '#fff',
  isCustomBg: false,
  quickMenuRef: { current: { open: () => {} } },
};

const renderGroup = (item: IMenuItem, collapsed: boolean, overrides: Partial<typeof baseProps> & { isLight?: boolean } = {}) => {
  const { container } = render(
    <MemoryRouter initialEntries={['/elsewhere']}>
      <MenuGroup item={item} collapsed={collapsed} {...baseProps} {...overrides} />
    </MemoryRouter>,
  );
  // The group row is the first child of MenuGroup's root; the submenu container is its sibling.
  // Child rows are anchors too, so the row has to be addressed by position rather than by tag.
  return { container, groupRow: container.firstElementChild?.firstElementChild };
};

describe('collapsed MenuGroup row', () => {
  it('links the group icon to its first visible child', () => {
    const item = {
      key: 'explorer',
      label: 'menu.explorer',
      children: [
        { key: 'metrics', label: 'menu.metrics', type: 'tabs', children: [{ key: '/metric/explorer', label: 'menu.metric_explorer' }] },
        { key: '/log/explorer', label: 'menu.logs_explorer' },
      ],
    } satisfies IMenuItem;

    const { groupRow } = renderGroup(item, true);

    expect(groupRow?.tagName).toBe('A');
    expect(groupRow).toHaveAttribute('href', '/metric/explorer');
  });

  it('skips a child that is filtered out of the visible list', () => {
    const item = {
      key: 'explorer',
      label: 'menu.explorer',
      children: [
        // A tabs child with no children of its own is not rendered, so it must not be the target either.
        { key: 'metrics', label: 'menu.metrics', type: 'tabs', children: [] },
        { key: '/log/explorer', label: 'menu.logs_explorer' },
      ],
    } satisfies IMenuItem;

    const { groupRow } = renderGroup(item, true);

    expect(groupRow?.tagName).toBe('A');
    expect(groupRow).toHaveAttribute('href', '/log/explorer');
  });

  it('leaves the row unclickable when the group has no visible child', () => {
    const item = { key: 'explorer', label: 'menu.explorer', children: [] } satisfies IMenuItem;

    const { groupRow } = renderGroup(item, true);

    expect(groupRow?.tagName).toBe('DIV');
  });

  it('keeps the expanded group row a non-link toggle', () => {
    const item = {
      key: 'explorer',
      label: 'menu.explorer',
      children: [{ key: '/log/explorer', label: 'menu.logs_explorer' }],
    } satisfies IMenuItem;

    const { container, groupRow } = renderGroup(item, false);

    // Expanded, the group row still just toggles; the only anchors are the child rows.
    expect(groupRow?.tagName).toBe('DIV');
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/log/explorer']);
  });

  // A bare <a> takes the global link color, which on the theme-color sidebar is the same
  // purple as the background - the collapsed icon then renders invisible against it.
  it('spells out the sidebar text color on the collapsed link row', () => {
    const item = {
      key: 'explorer',
      label: 'menu.explorer',
      children: [{ key: '/log/explorer', label: 'menu.logs_explorer' }],
    } satisfies IMenuItem;

    const onCustomBg = renderGroup(item, true, { isCustomBg: true }).groupRow;
    expect(onCustomBg?.tagName).toBe('A');
    expect(onCustomBg).toHaveClass('text-[#e6e6e8]');

    const onLightBg = renderGroup(item, true, { isLight: true }).groupRow;
    expect(onLightBg).toHaveClass('text-[var(--fc-sidemenu-item-text)]');
  });
});

describe('side menu icon colors', () => {
  const baseColorOptions = {
    isLight: false,
    isActive: false,
    isBlueTheme: false,
    isCustomBg: true,
    isBgBlack: false,
  };

  it('uses the theme link color for inactive dark-mode icons and white for active icons', () => {
    expect(getSideMenuIconColorClass({ ...baseColorOptions, isDarkMode: true })).toBe('text-link');
    expect(getSideMenuIconColorClass({ ...baseColorOptions, isDarkMode: true, isActive: true })).toBe('text-[#fff]');
  });

  it('preserves the existing colors for light, blue, and custom side menu themes', () => {
    expect(getSideMenuIconColorClass({ ...baseColorOptions, isLight: true, isCustomBg: false })).toContain('var(--fc-sidemenu-item-icon)');
    expect(getSideMenuIconColorClass({ ...baseColorOptions, isBlueTheme: true, isCustomBg: false })).toBe('text-[#427AF4]');
    expect(getSideMenuIconColorClass(baseColorOptions)).toBe('');
  });

  it.each([true, false])('applies the dark-mode rule to collapsed=%s top-level icon variants', (collapsed) => {
    localStorage.removeItem('n9e-dark-mode');
    const list: IMenuItem[] = [
      {
        key: '/flashai',
        label: 'FlashAI',
        icon: <span data-icon-type='flashai' />,
        children: [],
      },
      {
        key: 'dashboards-group',
        label: 'menu.dashboards',
        icon: <span data-icon-type='dashboard-group' />,
        children: [{ key: '/dashboards', label: 'menu.dashboards' }],
      },
    ];
    const { container } = render(
      <MemoryRouter initialEntries={['/elsewhere']}>
        <MenuList
          list={list}
          collapsed={collapsed}
          selectedKeys={[]}
          sideMenuBgColor='var(--fc-menu-dark-bg)'
          isCustomBg
          isDarkMode
          quickMenuRef={{ current: { open: () => {} } }}
        />
      </MemoryRouter>,
    );

    for (const type of ['house', 'icon-ic_search_light', 'flashai', 'dashboard-group']) {
      expect(container.querySelector(`[data-icon-type='${type}']`)?.parentElement).toHaveClass('text-link');
    }
  });

  it.each([
    ['/landing', 'house'],
    ['/flashai', 'flashai'],
    ['/dashboards', 'dashboard-group'],
  ])('uses white for the active %s icon', (selectedKey, iconType) => {
    localStorage.removeItem('n9e-dark-mode');
    const list: IMenuItem[] = [
      {
        key: '/flashai',
        label: 'FlashAI',
        icon: <span data-icon-type='flashai' />,
        children: [],
      },
      {
        key: 'dashboards-group',
        label: 'menu.dashboards',
        icon: <span data-icon-type='dashboard-group' />,
        children: [{ key: '/dashboards', label: 'menu.dashboards' }],
      },
    ];
    const { container } = render(
      <MemoryRouter initialEntries={[selectedKey]}>
        <MenuList
          list={list}
          collapsed
          selectedKeys={[selectedKey]}
          sideMenuBgColor='var(--fc-menu-dark-bg)'
          isCustomBg
          isDarkMode
          quickMenuRef={{ current: { open: () => {} } }}
        />
      </MemoryRouter>,
    );

    expect(container.querySelector(`[data-icon-type='${iconType}']`)?.parentElement).toHaveClass('text-[#fff]');
  });
});
