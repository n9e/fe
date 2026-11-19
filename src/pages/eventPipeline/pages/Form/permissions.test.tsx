/** @jest-environment jsdom */
import React from 'react';
import { Form, Input } from 'antd';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WorkflowForm from './index';

let mockCanAccess = false;
let mockSortEnd: (indexes: { oldIndex: number; newIndex: number }) => void;
jest.mock('@/components/AiChat/hooks/useFlashAiAccess', () => ({ useCanAccessFlashAiChat: () => mockCanAccess }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en_US' } }), Trans: () => null }));
jest.mock('@/services/manage', () => ({ getTeamInfoList: () => Promise.resolve({ dat: [{ id: 1, name: 'team' }] }) }));
jest.mock('@/utils', () => ({ scrollToFirstError: jest.fn() }));
jest.mock('@/components/KVTagSelect', () => ({ KVTags: () => null }));
jest.mock('@/components/AffixWrapper', () => ({ children }) => <div>{children}</div>);
jest.mock('@/pages/alertRules/FormNG/components/SectionCard', () => ({ children }) => <div>{children}</div>);
jest.mock('./Attributes', () => () => null);
jest.mock('./TestModal', () => () => null);
jest.mock('../../components/ScenarioTips', () => () => null);
jest.mock('./Processor', () => ({ field }) => (
  <Form.Item name={[field.name, 'typ']}>
    <Input aria-label={`type-${field.name}`} />
  </Form.Item>
));
jest.mock('react-sortable-hoc', () => ({
  SortableHandle: (Component) => Component,
  SortableElement: (Component) => (props) =>
    (
      <div data-testid={`sort-${props.index}`} data-disabled={props.disabled}>
        <Component {...props} />
      </div>
    ),
  SortableContainer: (Component) => (props) => {
    mockSortEnd = props.onSortEnd;
    return <Component {...props} />;
  },
}));

beforeEach(() => {
  mockCanAccess = false;
});

it.each([
  [1, 0, ['callback', 'ai_summary', 'event_drop', 'event_update']],
  [0, 2, ['callback', 'ai_summary', 'event_drop', 'event_update']],
  [2, 0, ['callback', 'ai_summary', 'event_drop', 'event_update']],
  [2, 3, ['callback', 'ai_summary', 'event_update', 'event_drop']],
])('guards drag sorting from %s to %s and preserves restricted config on save', async (oldIndex, newIndex, expected) => {
  const stored = { typ: 'ai_summary', config: { prompt_template: 'keep me', llm_config_id: 7 } };
  const onOk = jest.fn();
  render(
    <WorkflowForm
      onOk={onOk}
      onCancel={jest.fn()}
      initialValues={{ name: 'existing', team_ids: [1], processors: [{ typ: 'callback' }, stored, { typ: 'event_drop' }, { typ: 'event_update' }] } as any}
    />,
  );
  expect(screen.getByTestId('sort-1')).toHaveAttribute('data-disabled', 'true');
  act(() => mockSortEnd({ oldIndex, newIndex }));
  expect(screen.getAllByRole('textbox', { name: /^type-/ }).map((input: HTMLInputElement) => input.value)).toEqual(expected);
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.save' }));
  await waitFor(() => expect(onOk).toHaveBeenCalledTimes(1));
  expect(onOk.mock.calls[0][0].processors.find((item) => item.typ === 'ai_summary')).toEqual(stored);
});

it('rechecks permission when a drag started before revocation finishes', () => {
  mockCanAccess = true;
  const props = {
    onCancel: jest.fn(),
    initialValues: { name: 'existing', team_ids: [1], processors: [{ typ: 'callback' }, { typ: 'flashai_automation', config: { cron_id: 'job-7' } }] } as any,
  };
  const { rerender } = render(<WorkflowForm {...props} />);
  const finishDrag = mockSortEnd;
  mockCanAccess = false;
  rerender(<WorkflowForm {...props} />);
  act(() => finishDrag({ oldIndex: 1, newIndex: 0 }));
  expect(screen.getByLabelText('type-1')).toHaveValue('flashai_automation');
  mockCanAccess = true;
  rerender(<WorkflowForm {...props} />);
  act(() => mockSortEnd({ oldIndex: 1, newIndex: 0 }));
  expect(screen.getByLabelText('type-0')).toHaveValue('flashai_automation');
});
