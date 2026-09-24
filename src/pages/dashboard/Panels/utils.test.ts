jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');

  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import {
  buildLayout,
  canEditPanelLayout,
  handleRowToggle,
  isValidPanelConfig,
  mergePanelsToConfig,
  updatePanelsInsertNewPanelToRow,
  updatePanelsInsertNewPanelToGlobal,
} from './utils';
import { IDashboardConfig, IPanel } from '../types';

describe('buildLayout', () => {
  const panels = [
    { id: 'chart-1', type: 'timeseries', layout: { x: 0, y: 0, w: 12, h: 4, i: 'chart-1' } },
    { id: 'row-1', type: 'row', layout: { x: 0, y: 4, w: 24, h: 1, i: 'row-1' } },
  ] as IPanel[];

  it('hides all resize handles in read-only mode', () => {
    expect(buildLayout(panels)).toEqual([expect.objectContaining({ isResizable: true }), expect.objectContaining({ isResizable: false })]);
    expect(buildLayout(panels, true)).toEqual([expect.objectContaining({ isResizable: false }), expect.objectContaining({ isResizable: false })]);
  });
});

describe('canEditPanelLayout', () => {
  it.each([
    [true, true, true],
    [false, true, false],
    [true, false, false],
    [false, false, false],
  ])('requires both editability and dashboard write permission', (editable, isAuthorized, expected) => {
    expect(canEditPanelLayout(editable, isAuthorized)).toBe(expected);
  });
});

describe('mergePanelsToConfig', () => {
  it('does not mutate rendered config or panels while removing runtime repeat data', () => {
    const configs = { version: '4.1.0', panels: [] } as IDashboardConfig;
    const panels = [
      {
        id: 'source',
        type: 'timeseries',
        layout: { i: 'source', x: 0, y: 0, w: 12, h: 4 },
        scopedVars: { host: { value: 'a' } },
      },
      {
        id: 'repeat',
        type: 'timeseries',
        repeatPanelId: 'source',
        layout: { i: 'repeat', x: 12, y: 0, w: 12, h: 4 },
      },
    ] as IPanel[];

    const result = mergePanelsToConfig(configs, panels);

    expect(result).not.toBe(configs);
    expect(result.panels).toHaveLength(1);
    expect(result.panels[0].scopedVars).toBeUndefined();
    expect(configs.panels).toEqual([]);
    expect(panels).toHaveLength(2);
    expect(panels[0].scopedVars).toEqual({ host: { value: 'a' } });
  });
});

describe('isValidPanelConfig', () => {
  it('returns true for valid panel config JSON', () => {
    const json = JSON.stringify({ type: 'timeseries', title: 'CPU' });
    expect(isValidPanelConfig(json)).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidPanelConfig('')).toBe(false);
  });

  it('returns false for invalid JSON', () => {
    expect(isValidPanelConfig('not json')).toBe(false);
  });

  it('returns false for JSON without type field', () => {
    const json = JSON.stringify({ name: 'test' });
    expect(isValidPanelConfig(json)).toBe(false);
  });

  it('returns false for JSON array', () => {
    const json = JSON.stringify([{ type: 'timeseries' }]);
    expect(isValidPanelConfig(json)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidPanelConfig(JSON.stringify(null))).toBe(false);
  });
});

describe('updatePanelsInsertNewPanelToRow', () => {
  const row: IPanel = {
    id: 'row-1',
    type: 'row',
    name: 'Group',
    layout: { x: 0, y: 0, w: 24, h: 1, i: 'row-1' },
  };

  it('uses original panel dimensions when useDefaultSize is false', () => {
    const panels = [row];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToRow(panels, 'row-1', pastedPanel, false);
    expect(result).toHaveLength(2);
    expect(result[0].layout.w).toBe(8);
    expect(result[0].layout.h).toBe(6);
  });

  it('uses default dimensions when useDefaultSize is true', () => {
    const panels = [row];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToRow(panels, 'row-1', pastedPanel, true);
    expect(result).toHaveLength(2);
    expect(result[0].layout.w).toBe(12);
    expect(result[0].layout.h).toBe(4);
  });

  it('uses default dimensions by default', () => {
    const panels = [row];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToRow(panels, 'row-1', pastedPanel);
    expect(result[0].layout.w).toBe(12);
    expect(result[0].layout.h).toBe(4);
  });

  it('inserts panel at correct Y position after existing panels in row', () => {
    const panelInRow: IPanel = {
      id: 'chart-1',
      type: 'timeseries',
      layout: { x: 0, y: 1, w: 12, h: 4, i: 'chart-1' },
    };
    const panels = [row, panelInRow];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToRow(panels, 'row-1', pastedPanel, false);
    expect(result[0].layout.y).toBe(5); // maxY = row(0)+1 or chart-1(1)+4 = 5
    expect(result[0].layout.w).toBe(8);
    expect(result[0].layout.h).toBe(6);
  });

  it('falls back to default w/h when panel has no layout.w/layout.h and useDefaultSize is false', () => {
    const panels = [row];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, i: 'p-1' },
    } as IPanel;

    const result = updatePanelsInsertNewPanelToRow(panels, 'row-1', pastedPanel, false);
    expect(result[0].layout.w).toBe(12);
    expect(result[0].layout.h).toBe(4);
  });
});

describe('handleRowToggle', () => {
  const row: IPanel = {
    id: 'row-1',
    type: 'row',
    name: 'Group',
    collapsed: false,
    layout: { x: 0, y: 0, w: 24, h: 1, i: 'row-1' },
  };
  const chart: IPanel = {
    id: 'chart-1',
    type: 'timeseries',
    layout: { x: 0, y: 1, w: 12, h: 4, i: 'chart-1' },
  };

  it('uses true for collapsed and false for expanded', () => {
    const collapsed = handleRowToggle(true, [row, chart], row);
    expect(collapsed).toEqual([expect.objectContaining({ id: 'row-1', collapsed: true, panels: [expect.objectContaining({ id: 'chart-1' })] })]);

    const expanded = handleRowToggle(false, collapsed, collapsed[0]);
    expect(expanded).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'row-1', collapsed: false, panels: [] }), expect.objectContaining({ id: 'chart-1' })]));
  });
});

describe('updatePanelsInsertNewPanelToGlobal', () => {
  it('uses original panel dimensions when useDefaultSize is false', () => {
    const panels: IPanel[] = [];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToGlobal(panels, pastedPanel, 'chart', false);
    expect(result[0].layout.w).toBe(8);
    expect(result[0].layout.h).toBe(6);
  });

  it('uses default dimensions when useDefaultSize is true', () => {
    const panels: IPanel[] = [];
    const pastedPanel = {
      id: 'p-1',
      type: 'timeseries',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'p-1' },
    };

    const result = updatePanelsInsertNewPanelToGlobal(panels, pastedPanel, 'chart', true);
    expect(result[0].layout.w).toBe(12);
    expect(result[0].layout.h).toBe(4);
  });
});
