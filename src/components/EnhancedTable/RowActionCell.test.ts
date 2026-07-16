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

  it('expands kebab actions into icons when the row fits the limit, danger last', () => {
    const actions: RowActions = {
      inline: [act('run')],
      menu: [act('delete', { danger: true }), act('edit'), act('copy')],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['run', 'edit', 'copy', 'delete']);
    expect(kebab).toEqual([]);
  });

  it('keeps the full kebab when the row exceeds the limit', () => {
    const actions: RowActions = {
      inline: [act('run')],
      menu: [act('edit'), act('copy'), act('export'), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['run']);
    expect(keys(kebab)).toEqual(['edit', 'copy', 'export', 'delete']);
  });

  it('honors a custom limit', () => {
    const actions: RowActions = { menu: [act('edit'), act('copy'), act('export'), act('offline'), act('delete')] };
    expect(keys(splitRowActions(actions, 5).icons)).toEqual(['edit', 'copy', 'export', 'offline', 'delete']);
    expect(keys(splitRowActions(actions, 2).kebab)).toEqual(['edit', 'copy', 'export', 'offline', 'delete']);
  });

  it('pins node and collapsed items in the kebab while the rest expand', () => {
    const actions: RowActions = {
      menu: [act('edit'), act('bespoke', { node: 'x' }), act('reset', { collapsed: true }), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['edit', 'delete']);
    expect(keys(kebab)).toEqual(['bespoke', 'reset']);
  });

  it('ignores hidden actions when counting against the limit', () => {
    const actions: RowActions = {
      menu: [act('edit'), act('copy'), act('export', { visible: false }), act('offline'), act('delete', { danger: true })],
    };
    const { icons, kebab } = splitRowActions(actions);
    expect(keys(icons)).toEqual(['edit', 'copy', 'offline', 'delete']);
    expect(kebab).toEqual([]);
  });
});
