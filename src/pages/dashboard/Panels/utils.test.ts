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
  cleanUpRepeats,
  getRowPanels,
  getRowRepeatHeight,
  getSelectedRepeatOptions,
  processRepeats,
  repeatRowChildren,
  sortPanelsByGridLayout,
  updatePanelsLayout,
} from './utils';
import { IDashboardConfig, IPanel } from '../types';
import type { IVariable } from '../Variables/types';

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

  it('uses a compact default size for aiButton panels and keeps a pasted size', () => {
    const panels = [row];
    const aiButtonPanel = {
      id: 'ai-1',
      type: 'aiButton',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'ai-1' },
    };

    const inserted = updatePanelsInsertNewPanelToRow(panels, 'row-1', aiButtonPanel, true);
    expect(inserted[0].layout.w).toBe(4);
    expect(inserted[0].layout.h).toBe(2);

    const pasted = updatePanelsInsertNewPanelToRow(panels, 'row-1', aiButtonPanel, false);
    expect(pasted[0].layout.w).toBe(8);
    expect(pasted[0].layout.h).toBe(6);
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

  it('uses a compact default size for aiButton panels and keeps a pasted size', () => {
    const panels: IPanel[] = [];
    const aiButtonPanel = {
      id: 'ai-1',
      type: 'aiButton',
      layout: { x: 0, y: 10, w: 8, h: 6, i: 'ai-1' },
    };

    const inserted = updatePanelsInsertNewPanelToGlobal(panels, aiButtonPanel, 'chart', true);
    expect(inserted[0].layout.w).toBe(4);
    expect(inserted[0].layout.h).toBe(2);

    const pasted = updatePanelsInsertNewPanelToGlobal(panels, aiButtonPanel, 'chart', false);
    expect(pasted[0].layout.w).toBe(8);
    expect(pasted[0].layout.h).toBe(6);
  });
});

function makePanel(id: string, y: number, overrides: Partial<IPanel> = {}): IPanel {
  return {
    id,
    type: 'timeseries',
    name: id,
    description: '',
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: id, x: 0, y, w: 12, h: 4 },
    ...overrides,
  } satisfies IPanel;
}

function makeRow(id: string, y: number, overrides: Partial<IPanel> = {}): IPanel {
  return makePanel(id, y, { type: 'row', collapsed: false, layout: { i: id, x: 0, y, w: 24, h: 1 }, ...overrides });
}

function makeVariable(name: string, value: IVariable['value'] = ['a', 'b', 'c']): IVariable {
  return { name, value, type: 'custom', definition: '', datasource: { cate: 'prometheus' } } satisfies IVariable;
}

const regionVariable = makeVariable('region');
const baseConfig = { version: '4.1.0', panels: [] } as IDashboardConfig;

function rowRepeatPanels(collapsed = false) {
  const child = makePanel('chart', 1);
  return [
    makeRow('row', 0, { repeat: 'region', collapsed, ...(collapsed ? { panels: [child] } : {}) }),
    ...(collapsed ? [] : [child]),
    makeRow('next', collapsed ? 1 : 5),
    makePanel('below', collapsed ? 2 : 6),
  ];
}

describe('panel repeats', () => {
  it('uses deterministic ids and equal widths without pushing an extra empty line', () => {
    const panels = [makePanel('chart', 0, { repeat: 'region' }), makePanel('below', 4)];
    const result = processRepeats(panels, [makeVariable('region', ['a', 'b'])]);
    expect(result.map((panel) => panel.id)).toEqual(['chart', 'chart__repeat_1', 'below']);
    expect(result.map((panel) => panel.layout)).toEqual([
      { i: 'chart', x: 0, y: 0, w: 12, h: 4 },
      { i: 'chart__repeat_1', x: 12, y: 0, w: 12, h: 4 },
      { i: 'below', x: 0, y: 4, w: 12, h: 4 },
    ]);
    expect(result[1]).toMatchObject({ repeatPanelId: 'chart', repeat: undefined, scopedVars: { region: { value: 'b' } } });
    expect(processRepeats(result, [makeVariable('region', ['a', 'b'])])).toEqual(result);
  });

  it('wraps at maxPerRow, pushes following panels by the occupied extra height, and restores saved layout', () => {
    const panels = [makePanel('chart', 0, { repeat: 'region', maxPerRow: 2 }), makePanel('below', 4)];
    const result = processRepeats(panels, [regionVariable]);
    expect(result.map((panel) => [panel.layout.x, panel.layout.y, panel.layout.w])).toEqual([
      [0, 0, 12],
      [12, 0, 12],
      [0, 4, 12],
      [0, 8, 12],
    ]);
    expect(processRepeats(result, [regionVariable])).toEqual(result);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(panels);
  });

  it('restores the original x and width when the repeat selection changes', () => {
    const panels = [makePanel('chart', 0, { repeat: 'region', layout: { i: 'chart', x: 8, y: 0, w: 8, h: 4 } })];
    const result = processRepeats(panels, [regionVariable]);
    expect(result[0].layout.w).toBe(8);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(panels);
    expect(processRepeats(result, [])).toEqual(panels);
  });

  it('normalizes scalar, array and all selections and skips scalar numbers', () => {
    expect(getSelectedRepeatOptions(makeVariable('region', 'a'))).toEqual(['a']);
    expect(getSelectedRepeatOptions(makeVariable('region', ['a', 'b']))).toEqual(['a', 'b']);
    expect(getSelectedRepeatOptions(makeVariable('region', 7))).toEqual([]);
    expect(getSelectedRepeatOptions({ ...regionVariable, value: undefined })).toEqual([]);
    const variable = {
      ...regionVariable,
      value: ['all'],
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    } satisfies IVariable;
    expect(getSelectedRepeatOptions(variable)).toEqual(['a', 'b']);
    expect(processRepeats([makePanel('chart', 0, { repeat: 'region' })], [variable])).toHaveLength(2);
    expect(processRepeats([makePanel('chart', 0, { repeat: 'region' })], [makeVariable('region', 7)])).toHaveLength(1);
  });

  it('keeps fractional-width repeats in the expected row when importing a large maxPerRow', () => {
    const variable = makeVariable(
      'host',
      Array.from({ length: 13 }, (_, index) => `host-${index}`),
    );
    const input = [makePanel('chart', 0, { repeat: 'host', maxPerRow: 24 }), makeRow('next', 4)];
    const result = processRepeats(input, [variable]);
    expect(result.filter((item) => item.type !== 'row').map((item) => item.layout.y)).toEqual(Array(13).fill(0));
    expect(result.find((item) => item.id === 'next')?.layout.y).toBe(4);
    expect(processRepeats(result, [variable])).toEqual(result);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
  });
});

describe('row repeat state combinations', () => {
  const cases = [false, true].flatMap((initiallyCollapsed) => [2, 5].flatMap((hostCount) => Array.from({ length: 8 }, (_, mask) => ({ initiallyCollapsed, hostCount, mask }))));
  it.each(cases)('preserves groups, scopes and saved definitions for $initiallyCollapsed/$hostCount/$mask', ({ initiallyCollapsed, hostCount, mask }) => {
    const { compact } = jest.requireActual('react-grid-layout/build/utils');
    const children = [makePanel('repeat-chart', 1, { repeat: 'host', maxPerRow: 2 }), makePanel('plain-chart', 5)];
    const input = [
      makeRow('row', 0, { repeat: 'region', collapsed: initiallyCollapsed, ...(initiallyCollapsed ? { panels: children } : {}) }),
      ...(initiallyCollapsed ? [] : children),
      makeRow('next', initiallyCollapsed ? 1 : 9),
    ];
    const variables = [
      regionVariable,
      makeVariable(
        'host',
        Array.from({ length: hostCount }, (_, index) => `h${index}`),
      ),
    ];
    let runtime = processRepeats(input, variables);
    const rowIds = ['row', 'row__row_repeat_1', 'row__row_repeat_2'];
    rowIds.forEach((id, index) => {
      const row = runtime.find((item) => item.id === id)!;
      const collapsed = !!(mask & (1 << index));
      if (!!row.collapsed !== collapsed) {
        runtime = handleRowToggle(collapsed, runtime, row);
        if (!collapsed) runtime = repeatRowChildren(runtime, id, variables);
      }
      runtime = sortPanelsByGridLayout(updatePanelsLayout(runtime, compact(buildLayout(runtime), 'vertical', 24)));
    });
    const saved = mergePanelsToConfig(baseConfig, runtime);
    const processed = processRepeats(runtime, variables);
    expect(processRepeats(processed, variables)).toEqual(processed);
    expect(mergePanelsToConfig(baseConfig, processed)).toEqual(saved);
    rowIds.forEach((id, index) => {
      const row = processed.find((item) => item.id === id)!;
      expect(!!row.collapsed).toBe(!!(mask & (1 << index)));
      const visibleChildren = getRowPanels(processed, id);
      expect(visibleChildren).toHaveLength(row.collapsed ? 0 : hostCount + 1);
      for (const child of visibleChildren) expect(child.scopedVars?.region?.value).toBe(['a', 'b', 'c'][index]);
      const nextRow = processed.slice(processed.indexOf(row) + 1).find((item) => item.type === 'row')!;
      expect(getRowRepeatHeight(row, visibleChildren) + row.layout.y).toBeLessThanOrEqual(nextRow.layout.y);
    });
    expect(
      saved.panels
        .flatMap((item) => [item, ...(item.panels ?? [])])
        .map((item) => item.id)
        .sort(),
    ).toEqual(['next', 'plain-chart', 'repeat-chart', 'row']);
    for (const item of saved.panels.flatMap((panel) => [panel, ...(panel.panels ?? [])])) {
      expect(item).not.toHaveProperty('repeatPanelId');
      expect(item).not.toHaveProperty('repeatedByRow');
      expect(item).not.toHaveProperty('repeatSourceLayout');
      expect(item).not.toHaveProperty('scopedVars');
    }
  });
});

describe('row repeats', () => {
  it('repeats expanded rows, scopes their children and preserves grouping', () => {
    const input = rowRepeatPanels();
    const result = processRepeats(input, [regionVariable]);
    expect(result.map((panel) => [panel.id, panel.layout.y])).toEqual([
      ['row', 0],
      ['chart', 1],
      ['row__row_repeat_1', 5],
      ['chart__row_repeat_1', 6],
      ['row__row_repeat_2', 10],
      ['chart__row_repeat_2', 11],
      ['next', 15],
      ['below', 16],
    ]);
    ['a', 'b', 'c'].forEach((value, index) => {
      const row = result[index * 2];
      const child = getRowPanels(result, row.id)[0];
      expect(getRowPanels(result, row.id)).toHaveLength(1);
      expect(row.scopedVars).toEqual({ region: { value } });
      expect(child.scopedVars).toEqual(row.scopedVars);
      if (index > 0) {
        expect(row).toMatchObject({ repeatPanelId: 'row', repeat: undefined, layout: { i: row.id } });
        expect(child).toMatchObject({ repeatPanelId: 'chart', repeatedByRow: true, layout: { i: child.id } });
      }
    });
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
    expect(input).toEqual(rowRepeatPanels());
  });

  it('repeats collapsed row caches and pushes the following row by exactly two grid units', () => {
    const input = rowRepeatPanels(true);
    const result = processRepeats(input, [regionVariable]);
    expect(result.map((panel) => [panel.id, panel.layout.y])).toEqual([
      ['row', 0],
      ['row__row_repeat_1', 1],
      ['row__row_repeat_2', 2],
      ['next', 3],
      ['below', 4],
    ]);
    expect(result[1].panels).toEqual([expect.objectContaining({ id: 'chart__row_repeat_1', repeatPanelId: 'chart', repeatedByRow: true, scopedVars: { region: { value: 'b' } } })]);
    expect(processRepeats(result, [regionVariable])).toEqual(result);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
  });

  it.each([false, true])('is idempotent and removes all runtime fields from configuration (collapsed=%s)', (collapsed) => {
    const input = rowRepeatPanels(collapsed);
    const result = processRepeats(input, [regionVariable]);
    const snapshot = JSON.stringify(result);
    expect(processRepeats(result, [regionVariable])).toEqual(result);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
    expect(JSON.stringify(result)).toBe(snapshot);
    expect(processRepeats(result, [])).toEqual(input);
    expect(processRepeats(result, [makeVariable('other')])).toEqual(input);
  });

  it('keeps empty rows at least one grid unit high', () => {
    const row = makeRow('row', 0, { repeat: 'region' });
    expect(getRowRepeatHeight(row, [])).toBe(1);
    const result = processRepeats([row, makeRow('next', 1)], [regionVariable]);
    expect(result.map((panel) => panel.layout.y)).toEqual([0, 1, 2, 3]);
    expect(getRowPanels(result, 'row')).toEqual([]);
    expect(processRepeats(result, [regionVariable])).toEqual(result);
  });

  it('handles a single value, missing variables and numeric selections', () => {
    const input = rowRepeatPanels();
    expect(processRepeats(input, [makeVariable('region', 'a')])).toHaveLength(input.length);
    expect(processRepeats(input, [makeVariable('other')])).toEqual(input);
    expect(processRepeats(input, [makeVariable('region', 1)])).toEqual(input);
    const all = {
      ...regionVariable,
      value: 'all',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    } satisfies IVariable;
    expect(processRepeats(input, [all]).filter((panel) => panel.type === 'row')).toHaveLength(3);
  });

  it('expands panel repeats inside every row instance and remains idempotent across multiple repeated rows', () => {
    const input = rowRepeatPanels();
    input[1].repeat = 'host';
    input[1].maxPerRow = 2;
    input[2].repeat = 'region';
    const variables = [regionVariable, makeVariable('host')];
    const result = processRepeats(input, variables);
    expect(result.filter((panel) => panel.type !== 'row')).toHaveLength(12);
    const copiedChild = result.find((panel) => panel.id === 'chart__row_repeat_1')!;
    expect(copiedChild).toMatchObject({ repeat: 'host', repeatPanelId: 'chart', repeatedByRow: true, scopedVars: { region: { value: 'b' }, host: { value: 'a' } } });
    expect(result.find((panel) => panel.id === 'chart__row_repeat_1__repeat_2')).toMatchObject({
      repeatPanelId: copiedChild.id,
      repeatedByRow: true,
      scopedVars: { region: { value: 'b' }, host: { value: 'c' } },
    });
    expect(getRowPanels(result, 'row__row_repeat_1')).toHaveLength(3);
    expect(processRepeats(result, variables)).toEqual(result);
    expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
  });

  it.each([false, true])('uses the row-assigned value when a child repeats by the same variable (collapsed=%s)', (collapsed) => {
    const input = rowRepeatPanels(collapsed);
    const child = collapsed ? input[0].panels![0] : input[1];
    child.repeat = 'region';
    let result = processRepeats(input, [regionVariable]);
    ['a', 'b', 'c'].forEach((value, index) => {
      const rowId = index === 0 ? 'row' : `row__row_repeat_${index}`;
      if (collapsed) {
        const row = result.find((panel) => panel.id === rowId)!;
        result = repeatRowChildren(handleRowToggle(false, result, row), rowId, [regionVariable]);
      }
      const children = getRowPanels(result, rowId);
      expect(children).toHaveLength(1);
      expect(children[0].scopedVars).toEqual({ region: { value } });
      expect(children[0].layout.w).toBe(24);
    });
    if (!collapsed) {
      expect(processRepeats(result, [regionVariable])).toEqual(result);
      expect(mergePanelsToConfig(baseConfig, result).panels).toEqual(input);
    }
  });

  it('does not mistake another row instance for panel repeats when expanding the source row', () => {
    const input = rowRepeatPanels(true);
    input[0].panels![0].repeat = 'host';
    const variables = [regionVariable, makeVariable('host')];
    let result = processRepeats(input, variables);
    result = repeatRowChildren(handleRowToggle(false, result, result[1]), result[1].id, variables);
    result = repeatRowChildren(handleRowToggle(false, result, result[0]), result[0].id, variables);
    expect(getRowPanels(result, 'row')).toHaveLength(3);
    expect(getRowPanels(result, 'row__row_repeat_1')).toHaveLength(3);
    expect(getRowPanels(result, 'row').map((panel) => panel.scopedVars)).toEqual([
      { region: { value: 'a' }, host: { value: 'a' } },
      { region: { value: 'a' }, host: { value: 'b' } },
      { region: { value: 'a' }, host: { value: 'c' } },
    ]);
  });

  it('cleans panel repeats cached when an ordinary row is collapsed and restores them on expansion', () => {
    const input = [makeRow('row', 0), makePanel('chart', 1, { repeat: 'host', maxPerRow: 2 }), makeRow('next', 5)];
    const variables = [makeVariable('host')];
    const repeated = processRepeats(input, variables);
    const collapsed = handleRowToggle(true, repeated, repeated[0]);
    const saved = mergePanelsToConfig(baseConfig, collapsed).panels;
    expect(saved[0].panels).toEqual([input[1]]);
    expect(collapsed[0].panels).toHaveLength(3);
    const expanded = repeatRowChildren(handleRowToggle(false, saved, saved[0]), 'row', variables);
    expect(getRowPanels(expanded, 'row')).toHaveLength(3);
    expect(repeatRowChildren(expanded, 'row', variables)).toEqual(expanded);
  });

  it('cleans row-derived children even when they retain their own repeat field', () => {
    const panels = [
      makeRow('row', 0, {
        panels: [
          makePanel('source', 1, { repeat: 'host', scopedVars: { host: { value: 'a' } } }),
          makePanel('copy', 2, { repeat: 'host', repeatPanelId: 'source', repeatedByRow: true }),
        ],
      }),
    ];
    cleanUpRepeats(panels);
    expect(panels[0].panels).toEqual([makePanel('source', 1, { repeat: 'host' })]);
  });

  it('keeps copy collapse independent and restores following positions after expansion', () => {
    const repeated = processRepeats(rowRepeatPanels(), [regionVariable]);
    const copy = repeated.find((panel) => panel.id === 'row__row_repeat_1')!;
    const snapshot = JSON.stringify(repeated);
    const collapsed = handleRowToggle(true, repeated, copy);
    // 模拟 RGL 对折叠后的空白区执行 vertical compact。
    const compacted = updatePanelsLayout(
      collapsed,
      collapsed.map((panel) => ({ ...panel.layout, y: panel.layout.y > copy.layout.y ? panel.layout.y - 4 : panel.layout.y })),
    );
    expect(compacted.find((panel) => panel.id === 'row')?.collapsed).toBe(false);
    expect(compacted.find((panel) => panel.id === 'row__row_repeat_2')?.collapsed).toBe(false);
    expect(compacted.find((panel) => panel.id === 'next')?.layout.y).toBe(11);
    expect(mergePanelsToConfig(baseConfig, compacted)).toEqual(mergePanelsToConfig(baseConfig, repeated));
    const expanded = handleRowToggle(false, compacted, compacted.find((panel) => panel.id === copy.id)!);
    expect(expanded.map((panel) => [panel.id, panel.layout.y])).toEqual(repeated.map((panel) => [panel.id, panel.layout.y]));
    expect(JSON.stringify(repeated)).toBe(snapshot);
    expect(processRepeats(compacted, [regionVariable], { preserveRowState: false })).toEqual(repeated);
  });

  it('expands a collapsed copy without affecting the source or other instances', () => {
    const repeated = processRepeats(rowRepeatPanels(true), [regionVariable]);
    const expanded = handleRowToggle(false, repeated, repeated[1]);
    expect(expanded.find((panel) => panel.id === 'row')?.collapsed).toBe(true);
    expect(expanded.find((panel) => panel.id === 'row__row_repeat_2')).toMatchObject({ collapsed: true, layout: { y: 6 } });
    expect(expanded.find((panel) => panel.id === 'next')?.layout.y).toBe(7);
    expect(mergePanelsToConfig(baseConfig, expanded)).toEqual(mergePanelsToConfig(baseConfig, repeated));
  });

  it('expands nested panel repeats when opening a previously collapsed copy', () => {
    const input = rowRepeatPanels(true);
    input[0].panels![0].repeat = 'host';
    input[0].panels![0].maxPerRow = 2;
    const variables = [regionVariable, makeVariable('host')];
    const repeated = processRepeats(input, variables);
    const expanded = repeatRowChildren(handleRowToggle(false, repeated, repeated[1]), repeated[1].id, variables);
    expect(getRowPanels(expanded, repeated[1].id)).toHaveLength(3);
    expect(expanded.find((panel) => panel.id === 'chart__row_repeat_1__repeat_2')).toMatchObject({
      repeatedByRow: true,
      scopedVars: { region: { value: 'b' }, host: { value: 'c' } },
    });
    expect(expanded.find((panel) => panel.id === 'next')?.layout.y).toBe(11);
    expect(mergePanelsToConfig(baseConfig, expanded).panels).toEqual(input);
  });

  it('puts an ordinary panel dragged into a repeated instance back into the source group', () => {
    const repeated = processRepeats(rowRepeatPanels(), [regionVariable]);
    const moved = sortPanelsByGridLayout(repeated.map((panel) => (panel.id === 'below' ? { ...panel, layout: { ...panel.layout, x: 12, y: 7, h: 2 } } : panel)));
    const result = processRepeats(moved, [regionVariable]);
    expect(getRowPanels(result, 'row').map((panel) => panel.id)).toEqual(['chart', 'below']);
    expect(getRowPanels(result, 'row__row_repeat_1').map((panel) => panel.id)).toEqual(['chart__row_repeat_1', 'below__row_repeat_1']);
    expect(processRepeats(result, [regionVariable])).toEqual(result);
  });

  it('locks row-derived copies without changing normal panel repeats or setting static', () => {
    const input = rowRepeatPanels();
    input[1].repeat = 'host';
    const result = processRepeats(input, [regionVariable, makeVariable('host', ['a', 'b'])]);
    for (const panel of result) {
      const layout = buildLayout([panel])[0];
      if (panel.repeatedByRow || (panel.type === 'row' && panel.repeatPanelId)) {
        expect(layout).toMatchObject({ isDraggable: false, isResizable: false });
      } else {
        expect(layout).not.toHaveProperty('isDraggable');
        expect(layout.isResizable).toBe(panel.type !== 'row');
      }
      expect(layout).not.toHaveProperty('static');
    }
  });

  it.each([false, true])('preserves original panels stored inside a discarded copy cache (source collapsed=%s)', (collapsed) => {
    const repeated = processRepeats(rowRepeatPanels(collapsed), [regionVariable]);
    const copyId = 'row__row_repeat_1';
    let result = repeated;
    const copy = result.find((item) => item.id === copyId)!;
    if (copy.collapsed) result = handleRowToggle(false, result, copy);
    const expanded = result.find((item) => item.id === copyId)!;
    result.push(makePanel('incoming', expanded.layout.y + 2, { layout: { i: 'incoming', x: 12, y: expanded.layout.y + 2, w: 12, h: 2 } }));
    sortPanelsByGridLayout(result);
    result = handleRowToggle(true, result, expanded);
    const before = JSON.stringify(result);
    const saved = mergePanelsToConfig(baseConfig, result).panels;
    const originals = saved.flatMap((item) => [item, ...(item.panels ?? [])]);
    expect(originals.filter((item) => item.id === 'incoming')).toHaveLength(1);
    const source = saved.find((item) => item.id === 'row')!;
    expect((collapsed ? source.panels! : getRowPanels(saved, source.id)).map((item) => item.id)).toEqual(expect.arrayContaining(['chart', 'incoming']));
    expect(JSON.stringify(result)).toBe(before);
    const regenerated = processRepeats(result, [regionVariable]);
    const copyAfter = regenerated.find((item) => item.id === copyId)!;
    const children = copyAfter.collapsed ? copyAfter.panels! : getRowPanels(regenerated, copyId);
    expect(children.map((item) => item.repeatPanelId)).toEqual(expect.arrayContaining(['chart', 'incoming']));
    expect(processRepeats(regenerated, [regionVariable])).toEqual(regenerated);
  });

  it('keeps recovered originals aligned when earlier repeated groups push later source rows down', () => {
    const variable = makeVariable('region', ['a', 'b']);
    let panels = processRepeats(
      [makeRow('first', 0, { repeat: 'region' }), makePanel('first-chart', 1), makeRow('second', 5, { repeat: 'region' }), makePanel('second-chart', 6), makeRow('next', 10)],
      [variable],
    );
    panels = panels.map((panel) => ({ ...panel, layout: { ...panel.layout, y: panel.layout.y >= 10 ? panel.layout.y + 2 : panel.layout.y } }));
    panels.push(makePanel('first-incoming', 10, { layout: { i: 'first-incoming', x: 12, y: 10, w: 12, h: 2 } }));
    panels = panels.map((panel) => ({ ...panel, layout: { ...panel.layout, y: panel.layout.y >= 22 ? panel.layout.y + 2 : panel.layout.y } }));
    panels.push(makePanel('second-incoming', 22, { layout: { i: 'second-incoming', x: 12, y: 22, w: 12, h: 2 } }));
    const saved = mergePanelsToConfig(baseConfig, panels).panels;
    expect(saved.find((panel) => panel.id === 'first-incoming')?.layout.y).toBe(5);
    expect(saved.find((panel) => panel.id === 'second')?.layout.y).toBe(7);
    expect(saved.find((panel) => panel.id === 'second-incoming')?.layout.y).toBe(12);
    expect(saved.find((panel) => panel.id === 'next')?.layout.y).toBe(14);
    expect(getRowPanels(saved, 'second').map((panel) => panel.id)).toEqual(['second-chart', 'second-incoming']);
    const repeated = processRepeats(panels, [variable]);
    expect(processRepeats(repeated, [variable])).toEqual(repeated);
  });

  it('keeps an independently expanded copy open by default when adding a global panel', () => {
    const repeated = processRepeats(rowRepeatPanels(true), [regionVariable]);
    const opened = handleRowToggle(false, repeated, repeated[1]);
    const added = updatePanelsInsertNewPanelToGlobal(opened, makePanel('new', 0), 'chart');
    const result = processRepeats(added, [regionVariable]);
    expect(result.find((item) => item.id === 'row')?.collapsed).toBe(true);
    expect(result.find((item) => item.id === repeated[1].id)?.collapsed).toBe(false);
    expect(result.find((item) => item.id === repeated[2].id)?.collapsed).toBe(true);
    expect(result.find((item) => item.id === 'new')).toBeDefined();
    expect(processRepeats(result, [regionVariable])).toEqual(result);
    const reset = processRepeats(result, [regionVariable], { preserveRowState: false });
    expect(reset.find((item) => item.id === repeated[1].id)?.collapsed).toBe(true);
  });
});
