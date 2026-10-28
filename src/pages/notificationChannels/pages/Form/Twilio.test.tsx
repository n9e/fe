/** @jest-environment jsdom */
import React from 'react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Twilio from './Twilio';
import { normalizeFormValues } from '../../utils/normalizeValues';

jest.mock('../../constants', () => ({ NS: 'notification-channels' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let form: FormInstance;
function Editor({ initialValues }: { initialValues: Record<string, unknown> }) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <Form form={instance} initialValues={initialValues}>
      <Form.Item name='request_type' hidden>
        <Input />
      </Form.Item>
      <Twilio />
    </Form>
  );
}
async function validate(): Promise<string[]> {
  let names: string[] = [];
  await act(async () => {
    try {
      await form.validateFields();
    } catch (error) {
      names = (error as { errorFields: { name: string[] }[] }).errorFields.map((field) => field.name.join('.'));
    }
  });
  return names;
}
const cfg = {
  mode: 'sms',
  account_sid: `AC${'a'.repeat(32)}`,
  auth_token: 'test-token',
  from: '+14155552671',
  retry_times: 0,
};

it('validates clearing and restoring a sender, supports service-only SMS and switching to voice', async () => {
  render(<Editor initialValues={{ request_type: 'twilio', request_config: { twilio_request_config: cfg } }} />);
  expect(await validate()).toEqual([]);
  fireEvent.change(screen.getByLabelText('twilio_request_config.from'), { target: { value: '' } });
  expect(await validate()).toContain('request_config.twilio_request_config.from');
  fireEvent.change(screen.getByLabelText('twilio_request_config.messaging_service_sid'), { target: { value: `MG${'b'.repeat(32)}` } });
  expect(await validate()).toEqual([]);
  fireEvent.click(screen.getByLabelText('twilio_request_config.call'));
  expect(await validate()).toContain('request_config.twilio_request_config.from');
  fireEvent.change(screen.getByLabelText('twilio_request_config.from'), { target: { value: '+8613800138000' } });
  expect(await validate()).toEqual([]);
  const submitted = normalizeFormValues(form.getFieldsValue());
  expect(submitted.request_config.twilio_request_config).toMatchObject({ mode: 'voice', from: '+8613800138000', retry_times: 0 });
});

it('preserves saved voice settings and does not block other media types with hidden required fields', async () => {
  const { unmount } = render(
    <Editor initialValues={{ request_type: 'twilio', request_config: { twilio_request_config: { ...cfg, mode: 'voice', voice: 'woman', language: 'fr-FR' } } }} />,
  );
  expect((screen.getByLabelText('twilio_request_config.call') as HTMLInputElement).checked).toBe(true);
  expect(await validate()).toEqual([]);
  expect(normalizeFormValues(form.getFieldsValue()).request_config.twilio_request_config.language).toBe('fr-FR');
  unmount();
  render(<Editor initialValues={{ request_type: 'teams' }} />);
  expect(await validate()).toEqual([]);
  expect(normalizeFormValues(form.getFieldsValue()).request_config.twilio_request_config).toBeUndefined();
});
