import { runRowAction, splitRowActions } from './RowActionCell';
import type { RowAction, RowActions } from './types';

describe('runRowAction', () => {
  it('stops row click propagation, closes the menu, then runs the action', () => {
    const calls: string[] = [];
    const event = {
      stopPropagation: jest.fn(() => calls.push('stopPropagation')),
    };
    const closeMenu = jest.fn(() => calls.push('closeMenu'));
    const action: RowAction = {
      onClick: jest.fn(() => calls.push('action')),
    };

    runRowAction(action, event as any, closeMenu);

    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(closeMenu).toHaveBeenCalledTimes(1);
    expect(action.onClick).toHaveBeenCalledWith(event);
    expect(calls).toEqual(['stopPropagation', 'closeMenu', 'action']);
  });
});

describe('splitRowActions', () => {
  const act = (key: string, extra: Partial<RowAction> = {}): RowAction => ({ key, ...extra });
  const keys = (list: RowAction[]) => list.map((a) => a.key);

  it('expands a row within the limit entirely into icons, danger last, no kebab', () => {
    const actions: RowActions = {
      inline: [act('run')],
      menu: [act('delete', { danger: true }), act('edit')],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['run', 'edit', 'delete']);
    expect(kebab).toEqual([]);
  });

  it('surfaces at most 2 icons and collapses the rest when the row exceeds the limit', () => {
    const actions: RowActions = {
      inline: [act('run')],
      menu: [act('history'), act('edit'), act('copy'), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['run', 'history']);
    expect(keys(kebab)).toEqual(['edit', 'copy', 'delete']);
  });

  it('sinks danger items into the kebab instead of promoting them', () => {
    const actions: RowActions = {
      menu: [act('delete', { danger: true }), act('edit'), act('copy'), act('export')],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['edit', 'copy']);
    expect(keys(kebab)).toEqual(['delete', 'export']);
  });

  it('skips collapsed items during promotion so pinned low-frequency actions stay inside', () => {
    const actions: RowActions = {
      inline: [act('run')],
      menu: [act('history', { collapsed: true }), act('edit'), act('copy'), act('export', { collapsed: true }), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['run', 'edit']);
    expect(keys(kebab)).toEqual(['history', 'copy', 'export', 'delete']);
  });

  it('forces a kebab when a node item exists, even within the limit', () => {
    const actions: RowActions = {
      menu: [act('edit'), act('bespoke', { node: 'x' }), act('copy'), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['edit', 'copy']);
    expect(keys(kebab)).toEqual(['bespoke', 'delete']);
  });

  it('forceKebab collapses a row that would otherwise fit, keeping table layouts uniform', () => {
    const actions: RowActions = {
      menu: [act('edit'), act('copy'), act('delete', { danger: true })],
    };
    const fits = splitRowActions(actions);
    expect(keys(fits.icons)).toEqual(['edit', 'copy', 'delete']);
    expect(fits.kebab).toEqual([]);

    const forced = splitRowActions(actions, undefined, true);
    expect(keys(forced.icons)).toEqual(['edit', 'copy']);
    expect(keys(forced.kebab)).toEqual(['delete']);
  });

  it('honors a custom limit', () => {
    const actions: RowActions = { menu: [act('edit'), act('copy'), act('export'), act('offline')] };
    expect(keys(splitRowActions(actions, 4).icons)).toEqual(['edit', 'copy', 'export', 'offline']);
    expect(keys(splitRowActions(actions, 2).icons)).toEqual(['edit', 'copy']);
    expect(keys(splitRowActions(actions, 2).kebab)).toEqual(['export', 'offline']);
  });

  it('ignores hidden actions when counting against the limit', () => {
    const actions: RowActions = {
      menu: [act('edit'), act('copy', { visible: false }), act('offline'), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['edit', 'offline', 'delete']);
    expect(kebab).toEqual([]);
  });
});
