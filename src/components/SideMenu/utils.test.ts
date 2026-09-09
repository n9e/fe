/**
 * @jest-environment jsdom
 */
// utils.ts pulls in the real menu config, whose module graph uses `import.meta` (ESM-only).
// ts-jest cannot parse that, so stub the two leaves that reach for it.
jest.mock('@/components/IconFont', () => ({ __esModule: true, default: () => null }));
jest.mock('@/utils/constant', () => ({ __esModule: true, IS_PLUS: false, IS_ENT: false, N9E_PATHNAME: 'n9e' }));

import { getMenuItemPath, getStorageKey } from './utils';

describe('getMenuItemPath', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the key itself for a leaf menu item', () => {
    expect(getMenuItemPath({ key: '/log/explorer', label: 'menu.logs_explorer' })).toBe('/log/explorer');
  });

  it('falls back to the first tab for a tabs menu item that was never visited', () => {
    expect(
      getMenuItemPath({
        key: 'metrics',
        label: 'menu.metrics',
        type: 'tabs',
        children: [
          { key: '/metric/explorer', label: 'menu.metric_explorer' },
          { key: '/recording-rules', label: 'menu.recording_rules' },
        ],
      }),
    ).toBe('/metric/explorer');
  });

  it('prefers the remembered tab for a tabs menu item visited before', () => {
    localStorage.setItem(getStorageKey('metrics'), '/recording-rules');
    expect(
      getMenuItemPath({
        key: 'metrics',
        label: 'menu.metrics',
        type: 'tabs',
        children: [
          { key: '/metric/explorer', label: 'menu.metric_explorer' },
          { key: '/recording-rules', label: 'menu.recording_rules' },
        ],
      }),
    ).toBe('/recording-rules');
  });

  it('falls back to the item key when a tabs menu item has no children', () => {
    expect(getMenuItemPath({ key: 'devices', label: 'menu.devices', type: 'tabs', children: [] })).toBe('devices');
  });
});
