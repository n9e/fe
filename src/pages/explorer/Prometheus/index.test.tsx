/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { FormInstance } from 'antd/lib/form/Form';

import type PromGraph from '@/components/PromGraphCpt';
import type AiQueryDock from '@/components/AiQueryDock';
import type { AiButton } from '@/components/AiChatNG/FlashAiButton';
import type { IAiChatQueryContentContext } from '@/components/AiChatNG/types';
import type { useQueryDockActions } from '@/components/AiQueryDock/useQueryDockActions';
import Prometheus from './index';

type PromGraphProps = React.ComponentProps<typeof PromGraph>;
type AiQueryDockProps = React.ComponentProps<typeof AiQueryDock>;
type AiButtonProps = React.ComponentProps<typeof AiButton>;
type AiActionsOptions = Parameters<typeof useQueryDockActions>[0];

// Which build we are: the page reads IS_ENT at render time, so a getter lets
// each test pick the build without reloading the module.
const mockMode = { isEnt: false };
jest.mock('@/utils/constant', () => ({
  SIZE: 8,
  get IS_ENT() {
    return mockMode.isEnt;
  },
}));

// The graph is the page's only child that matters here: it renders the three
// slots the AI entry points live in, and echoes the query it was handed.
jest.mock('@/components/PromGraphCpt', () => ({
  __esModule: true,
  default: (props: PromGraphProps) => (
    <div>
      <div data-testid='leading'>{props.leadingExtra}</div>
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
jest.mock('@/components/AiChatNG/FlashAiButton', () => ({
  AiButton: (props: AiButtonProps) => (
    <button
      type='button'
      data-testid='ai-button'
      data-action={props.queryAction?.key}
      // The page ignores the context; an empty one is enough to exercise the wiring.
      onClick={() => props.onExecuteQueryForQueryContent?.('up', {} as unknown as IAiChatQueryContentContext)}
    />
  ),
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

describe('open-source and Nightingale commercial builds', () => {
  beforeEach(() => {
    mockMode.isEnt = false;
  });

  it('keeps the global chat button and never mounts the dock', () => {
    renderPage();
    expect(screen.getByTestId('ai-button')).toHaveAttribute('data-action', 'query_generator');
    expect(screen.queryByTestId('ai-dock')).toBeNull();
    expect(screen.queryByRole('button', { name: 'dock.open' })).toBeNull();
    expect(mockActions.enabled).not.toContain(true);
  });

  it('still lets the global chat write the query box', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('ai-button'));
    expect(screen.getByTestId('promql')).toHaveTextContent('up');
  });
});

describe('Flashcat enterprise build', () => {
  beforeEach(() => {
    mockMode.isEnt = true;
  });

  it('replaces the chat button with the dock and its entry', () => {
    renderPage();
    expect(screen.queryByTestId('ai-button')).toBeNull();
    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'false');
    expect(mockActions.enabled).not.toContain(true);

    fireEvent.click(screen.getByRole('button', { name: 'dock.open' }));

    expect(screen.getByTestId('ai-dock')).toHaveAttribute('data-open', 'true');
    expect(mockActions.enabled[mockActions.enabled.length - 1]).toBe(true);
  });
});
