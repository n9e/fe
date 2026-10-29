/** @jest-environment jsdom */
import React from 'react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import { act, fireEvent, render, screen } from '@testing-library/react';

import Pushover from './Pushover';
import SplunkOnCall from './SplunkOnCall';
import Line from './Line';

jest.mock('../../constants', () => ({ NS: 'notification-channels' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let form: FormInstance;
interface EditorProps {
  initialValues: Record<string, unknown>;
  children: React.ReactNode;
}

function Editor({ initialValues, children }: EditorProps) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <Form form={instance} initialValues={initialValues}>
      <Form.Item name='request_type' hidden>
        <Input />
      </Form.Item>
      {children}
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

const channels = [
  { requestType: 'pushover', Component: Pushover, config: { token: 'a'.repeat(30) } },
  { requestType: 'splunk_oncall', Component: SplunkOnCall, config: { api_key: 'test-key' } },
  { requestType: 'line', Component: Line, config: { channel_access_token: 'test-token' } },
] as const;

it.each(channels)('$requestType reveals a collapsed API URL error on every validation attempt', async ({ requestType, Component, config }) => {
  const configKey = `${requestType}_request_config`;
  render(
    <Editor initialValues={{ request_type: requestType, request_config: { [configKey]: config } }}>
      <Component />
    </Editor>,
  );
  const header = screen.getByRole('button', { name: /advanced_settings/ });
  expect(header.getAttribute('aria-expanded')).toBe('false');
  expect(await validate()).toEqual([]);
  expect(header.getAttribute('aria-expanded')).toBe('false');

  fireEvent.click(header);
  fireEvent.change(screen.getByLabelText('native_api_url'), { target: { value: 'api.example.com' } });
  const errorPath = `request_config.${configKey}.api_url`;
  expect(await validate()).toContain(errorPath);

  for (let attempt = 0; attempt < 2; attempt++) {
    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(await validate()).toContain(errorPath);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  }

  fireEvent.change(screen.getByLabelText('native_api_url'), { target: { value: 'https://api.example.com' } });
  expect(await validate()).toEqual([]);
  expect(header.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(header);
  expect(await validate()).toEqual([]);
  expect(header.getAttribute('aria-expanded')).toBe('false');
  expect(form.getFieldValue(['request_config', configKey, 'api_url'])).toBe('https://api.example.com');
});

it('keeps inactive media type panels closed when their API URLs are invalid', async () => {
  render(
    <Editor
      initialValues={{
        request_type: 'teams',
        request_config: Object.fromEntries(channels.map(({ requestType }) => [`${requestType}_request_config`, { api_url: 'invalid' }])),
      }}
    >
      {channels.map(({ requestType, Component }) => (
        <Component key={requestType} />
      ))}
    </Editor>,
  );
  expect(await validate()).toEqual([]);
  for (const header of screen.getAllByRole('button', { name: /advanced_settings/, hidden: true })) {
    expect(header.getAttribute('aria-expanded')).toBe('false');
  }
});
