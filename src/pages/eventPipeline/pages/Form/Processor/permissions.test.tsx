/** @jest-environment jsdom */
import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Processor from './index';
import TestModal from '../TestModal';

let mockCanAccess = true;
const mockLoadModels = jest.fn();
jest.mock('@/components/AiChat/hooks/useFlashAiAccess', () => ({ useCanAccessFlashAiChat: () => mockCanAccess }));
jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ IS_PLUS: true }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en_US' } }) }));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/UsageDocs', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock('plus:/parcels/eventPipeline', () => ({ __esModule: true, default: () => null, options: ['flashai_automation', 'label_enrich'] }));
jest.mock('./Relabel', () => () => null);
jest.mock('./Callback', () => () => null);
jest.mock('./EventDrop', () => () => null);
jest.mock('./AISummary', () => ({
  __esModule: true,
  default: ({ namePath }: { namePath: (string | number)[] }) => {
    useEffect(() => mockLoadModels(), []);
    return (
      <Form.Item name={[...namePath, 'prompt_template']}>
        <Input aria-label='summary prompt' />
      </Form.Item>
    );
  },
}));
jest.mock('@/pages/event/DetailNG', () => () => null);
jest.mock('../../../services', () => ({ eventProcessorTryrun: jest.fn(), eventPipelineTryrun: jest.fn() }));
jest.mock('../../../components/NodeResultsSteps', () => () => null);
jest.mock('../TestModal/EventsTable', () => () => null);
jest.mock('../TestModal/MockEventPanel', () => () => null);

type ProcessorValue = { typ?: string; config?: Record<string, unknown> };
let form: FormInstance;
function Host({ value = {} }: { value?: ProcessorValue }) {
  [form] = Form.useForm();
  return (
    <Form form={form} initialValues={{ processors: [value] }}>
      <Form.List name='processors'>{(fields, operations) => <Processor fields={fields} field={fields[0]} {...operations} />}</Form.List>
    </Form>
  );
}

beforeEach(() => {
  mockCanAccess = true;
});

it('removes both AI creation choices for users without FlashAI access and keeps ordinary processors', () => {
  mockCanAccess = false;
  render(<Host />);
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(screen.queryByText('processor.options.ai_summary')).toBeNull();
  expect(screen.queryByText('processor.options.flashai_automation')).toBeNull();
  expect(screen.getByText('processor.options.callback')).toBeInTheDocument();
  expect(screen.getByText('processor.options.label_enrich')).toBeInTheDocument();
});

it('keeps both AI choices when the shared permission gate allows access', () => {
  render(<Host />);
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(screen.getByText('processor.options.ai_summary')).toBeInTheDocument();
  expect(screen.getByText('processor.options.flashai_automation')).toBeInTheDocument();
});

it('preserves stored summary settings on submit without mounting the AI editor or its requests', async () => {
  mockCanAccess = false;
  const value = { typ: 'ai_summary', config: { prompt_template: 'existing prompt', llm_config_id: 7, custom_params: [{ key: 'temperature', value: '0.2' }] } };
  render(<Host value={value} />);
  expect(mockLoadModels).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('summary prompt')).toBeNull();
  expect(screen.queryByText('processor.help_btn')).toBeNull();
  expect(screen.queryByRole('img', { name: 'copy' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'common:btn.test' })).toBeNull();
  await act(async () => {
    expect(await form.validateFields()).toEqual({ processors: [value] });
  });
});

it('preserves an in-progress summary when access is revoked and restored', () => {
  const value = { typ: 'ai_summary', config: { prompt_template: 'original prompt', llm_config_id: 7 } };
  const { rerender } = render(<Host value={value} />);
  fireEvent.change(screen.getByLabelText('summary prompt'), { target: { value: 'edited prompt' } });
  mockCanAccess = false;
  rerender(<Host value={value} />);
  expect(screen.queryByLabelText('summary prompt')).toBeNull();
  expect(form.getFieldsValue().processors[0].config).toEqual({ prompt_template: 'edited prompt', llm_config_id: 7 });
  mockCanAccess = true;
  rerender(<Host value={value} />);
  expect(screen.getByLabelText('summary prompt')).toHaveValue('edited prompt');
});

it.each(['ai_summary', 'flashai_automation'])('hides whole-workflow testing when the workflow includes %s without access', (typ) => {
  mockCanAccess = false;
  render(<TestModal type='pipeline' config={{ processors: [{ typ: 'callback' }, { typ }] }} />);
  expect(screen.queryByRole('button', { name: 'common:btn.test' })).toBeNull();
});

it('keeps testing available for workflows containing only ordinary processors', () => {
  mockCanAccess = false;
  render(<TestModal type='pipeline' config={{ processors: [{ typ: 'callback' }] }} />);
  expect(screen.getByRole('button', { name: 'common:btn.test' })).toBeEnabled();
});

it('closes an open AI test on access revocation and does not reopen when access returns', async () => {
  const config = { typ: 'ai_summary', config: {} };
  const { rerender } = render(<TestModal type='processor' config={config} />);
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.test' }));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  mockCanAccess = false;
  rerender(<TestModal type='processor' config={config} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  mockCanAccess = true;
  rerender(<TestModal type='processor' config={config} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'common:btn.test' })).toBeEnabled();
});
