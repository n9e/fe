import { runRowAction } from './RowActionCell';
import type { RowAction } from './types';

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
