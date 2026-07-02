import { normalizeRowActions, runRowAction } from './RowActionCell';
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

describe('normalizeRowActions', () => {
  const actions: RowActions = {
    inline: [{ key: 'trace', text: 'Trace' }],
    menu: [
      { key: 'edit', text: 'Edit' },
      { key: 'delete', text: 'Delete', danger: true },
    ],
  };

  it('keeps menu actions collapsed by default', () => {
    expect(normalizeRowActions(actions)).toBe(actions);
  });

  it('promotes menu actions to inline actions when display is inline', () => {
    expect(normalizeRowActions(actions, 'inline')).toEqual({
      inline: [
        { key: 'trace', text: 'Trace' },
        { key: 'edit', text: 'Edit' },
        { key: 'delete', text: 'Delete', danger: true },
      ],
      menu: [],
    });
  });
});
