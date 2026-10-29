/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { FormInstance } from 'antd/lib/form/Form';

import type PromGraph from '@/components/PromGraphCpt';
import type AiQueryDock from '@/components/AiQueryDock';
import type { useQueryDockActions } from '@/components/AiQueryDock/useQueryDockActions';
import Prometheus from './index';

type PromGraphProps = React.ComponentProps<typeof PromGraph>;
type AiQueryDockProps = React.ComponentProps<typeof AiQueryDock>;
type AiActionsOptions = Parameters<typeof useQueryDockActions>[0];

jest.mock('@/utils/constant', () => ({ SIZE: 8, IS_ENT: false }));

// The graph is the page's only child that matters here: it renders the three
// slots the AI entry points live in, and echoes the query it was handed.
jest.mock('@/components/PromGraphCpt', () => ({
  __esModule: true,
  default: (props: PromGraphProps) => (
    <div>
      <div data-testid='leading'>{props.queryExtra}</div>
      <div data-testid='notice'>{props.noticeBanner}</div>
      <div data-testid='extra'>{props.extra}</div>
      <div data-testid='promql'>{props.promQL}</div>
    </div>
  ),
}));
jest.mock('@/components/AiQueryDock', () => ({
  __esModule: true,
  default: (props: AiQueryDockProps) => <div data-testid='ai-dock' data-open={String(props.open)} />,
}));
const mockActions = { enabled: [] as boolean[] };
jest.mock('@/components/AiQueryDock/useQueryDockActions', () => ({
  useQueryDockActions: (options: AiActionsOptions) => {
    mockActions.enabled.push(options.enabled);
    return { progress: { phase: 'idle' }, canUndo: false, prepareTurn: jest.fn(), undo: jest.fn(), cancel: jest.fn(), invalidateUndo: jest.fn(), reset: jest.fn() };
  },
}));
jest.mock('@/services/warning', () => ({ getHistoryEventsById: jest.fn() }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({ search: '' }), useHistory: () => ({ replace: jest.fn() }) }));
jest.mock('./HistoricalRecords', () => ({ __esModule: true, default: () => null, setLocalQueryHistory: jest.fn() }));
jest.mock('../components/ProbeBanner', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/TimeRangePicker', () => ({ timeRangeUnix: (range: unknown) => range, isMathString: () => false }));
jest.mock('@/components/AiChatNG/constants', () => ({ NAME_SPACE: 'ai' }));

const form = { validateFields: jest.fn(), setFieldsValue: jest.fn() } as unknown as FormInstance;

function renderPage() {
  return render(<Prometheus headerExtra={null} datasourceValue={1} form={form} />);
}

beforeEach(() => {
  mockActions.enabled = [];
});

describe('ai dock', () => {
  it('mounts the dock behind its trigger', () => {
    renderPage();
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'false');
    expect(mockActions.enabled).not.toContain(true);

    fireEvent.click(screen.getByRole('button', { name: 'dock.open' }));

    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'true');
    expect(mockActions.enabled[mockActions.enabled.length - 1]).toBe(true);
  });
});
