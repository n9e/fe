/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import UIActionBlock from './UIActionBlock';
import { UIActionCallSegment } from '../uiActionMessage';

const has = jest.fn();
const execute = jest.fn();

jest.mock('../uiActionRuntime', () => ({
  uiActionRuntime: {
    has: (name: string) => has(name),
    execute: (call: unknown) => execute(call),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function segment(overrides: Partial<UIActionCallSegment> = {}): UIActionCallSegment {
  return {
    kind: 'action',
    raw: '{"action": "fill_rules", "args": {"rules": []}}',
    closed: true,
    call: { name: 'fill_rules', args: { rules: [] } },
    ...overrides,
  };
}

function runButton() {
  return screen.getByRole('button', { name: /ui_action\.execute/ });
}

describe('UIActionBlock', () => {
  beforeEach(() => {
    has.mockReset().mockReturnValue(true);
    execute.mockReset().mockResolvedValue({ ok: true, status: 'ok', action: 'fill_rules', result: { applied: 2 } });
  });

  it('offers no way to run a block that is still streaming', () => {
    render(<UIActionBlock segment={segment({ closed: false, call: null })} />);

    expect(screen.getByText('ui_action.generating')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the raw text when the block is closed but unparseable', () => {
    render(<UIActionBlock segment={segment({ call: null, raw: '{"action":', error: 'bad json' })} />);

    expect(screen.getByText('ui_action.invalid_json')).toBeInTheDocument();
    expect(screen.getByText('{"action":')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables the run button when no page has registered the action', () => {
    has.mockReturnValue(false);
    render(<UIActionBlock segment={segment()} />);

    expect(screen.getByText('ui_action.unsupported')).toBeInTheDocument();
    expect(runButton()).toBeDisabled();
  });

  it('runs nothing until the user clicks, then reports success', async () => {
    render(<UIActionBlock segment={segment()} />);
    expect(execute).not.toHaveBeenCalled();

    fireEvent.click(runButton());

    await waitFor(() => expect(screen.getByText('ui_action.succeeded')).toBeInTheDocument());
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ name: 'fill_rules', args: { rules: [] } }));
  });

  it('surfaces the runtime message when the action fails', async () => {
    execute.mockResolvedValue({ ok: false, status: 'failed', action: 'fill_rules', message: 'date_format is required' });
    render(<UIActionBlock segment={segment()} />);

    fireEvent.click(runButton());

    await waitFor(() => expect(screen.getByText(/ui_action\.failed/)).toBeInTheDocument());
    expect(screen.getByText(/date_format is required/)).toBeInTheDocument();
  });

  it('gives each click its own call id, so a re-run is not a replayed result', async () => {
    render(<UIActionBlock segment={segment()} />);

    fireEvent.click(runButton());
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
    fireEvent.click(runButton());
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));

    expect(execute.mock.calls[0][0].callId).not.toBe(execute.mock.calls[1][0].callId);
  });
});
