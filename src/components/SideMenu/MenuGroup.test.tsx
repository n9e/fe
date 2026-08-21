/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// MenuList's module graph reaches `import.meta` (ESM-only), which ts-jest cannot parse.
jest.mock('@/components/IconFont', () => ({ __esModule: true, default: () => null }));
jest.mock('@/utils/constant', () => ({ __esModule: true, IS_PLUS: false, IS_ENT: false, N9E_PATHNAME: 'n9e' }));
jest.mock('react-i18next', () => ({ __esModule: true, useTranslation: () => ({ t: (key: string) => key }) }));
// antd/es and lucide-react ship untranspiled ESM, which jest does not transform inside node_modules.
jest.mock('antd/es/_util/placements', () => ({ __esModule: true, default: () => ({ rightTop: {} }) }));
jest.mock('lucide-react', () => ({ __esModule: true, House: () => null, Sparkles: () => null }));

import { MenuGroup } from './MenuList';
import { IMenuItem } from './types';

const baseProps = {
  sideMenuBgColor: '#fff',
  isCustomBg: false,
  quickMenuRef: { current: { open: () => {} } },
};

const renderGroup = (item: IMenuItem, collapsed: boolean) => {
  const { container } = render(
    <MemoryRouter initialEntries={['/elsewhere']}>
      <MenuGroup item={item} collapsed={collapsed} {...baseProps} />
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
});
