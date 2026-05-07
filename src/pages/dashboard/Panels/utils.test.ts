jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');

  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import { isValidPanelConfig, updatePanelsInsertNewPanelToRow, updatePanelsInsertNewPanelToGlobal } from './utils';
import { IPanel } from '../types';

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
