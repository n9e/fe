/** @jest-environment jsdom */
import React from 'react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Bark from './Bark';
import { normalizeFormValues } from '../../utils/normalizeValues';

jest.mock('../../constants', () => ({ NS: 'notification-channels' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/App', () => ({ CommonStateContext: jest.requireActual('react').createContext({ profile: {} }) }));
jest.mock('@/components/Contacts', () => () => null);
jest.mock('./ContactKeysSelect/services', () => ({
  getContactKeys: () => Promise.resolve([{ key: 'bark_device_key', label: 'Bark Device Key' }]),
}));

let form: FormInstance;
function Editor({ initialValues }: { initialValues: Record<string, unknown> }) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <Form form={instance} initialValues={initialValues}>
      <Form.Item name='request_type' hidden>
        <Input />
      </Form.Item>
      <Bark />
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
const preset = {
  request_type: 'bark',
  param_config: { user_info: { contact_key: 'bark_device_key' } },
  request_config: { bark_request_config: { timeout: 10000, retry_times: 3, retry_sleep: 1000 } },
};

it('works with an empty config and reads the device key from the Bark contact', async () => {
  render(<Editor initialValues={preset} />);
  expect(await screen.findByTitle('Bark Device Key')).toBeTruthy();
  expect(screen.getByText('bark_request_config.contact_hint')).toBeTruthy();
  expect(screen.getByText('bark_request_config.server_url_hint')).toBeTruthy();
  expect(await validate()).toEqual([]);
  const submitted = normalizeFormValues(form.getFieldsValue());
  expect(submitted.param_config.user_info.contact_key).toBe('bark_device_key');
  expect(submitted.request_config.bark_request_config).toMatchObject({ timeout: 10000, retry_times: 3, retry_sleep: 1000 });
});

it('requires username and password together and round-trips saved settings', async () => {
  const saved = { server_url: 'https://bark.example.com', username: 'n9e', password: 'secret', sound: 'alarm', group: 'Nightingale', retry_times: 0 };
  render(<Editor initialValues={{ ...preset, request_config: { bark_request_config: saved } }} />);
  expect((screen.getByLabelText(/^bark_request_config\.server_url/) as HTMLInputElement).value).toBe('https://bark.example.com');
  expect((screen.getByLabelText('bark_request_config.sound') as HTMLInputElement).value).toBe('alarm');
  expect(await validate()).toEqual([]);
  expect(normalizeFormValues(form.getFieldsValue()).request_config.bark_request_config).toMatchObject(saved);

  fireEvent.change(screen.getByLabelText('bark_request_config.password'), { target: { value: '' } });
  expect(await validate()).toContain('request_config.bark_request_config.username');
  fireEvent.change(screen.getByLabelText('bark_request_config.username'), { target: { value: '' } });
  expect(await validate()).toEqual([]);

  fireEvent.change(screen.getByLabelText(/^bark_request_config\.server_url/), { target: { value: 'api.day.app' } });
  expect(await validate()).toContain('request_config.bark_request_config.server_url');
});

it('keeps credentials made of spaces, as bark-server compares them as entered', async () => {
  render(<Editor initialValues={preset} />);
  fireEvent.change(screen.getByLabelText('bark_request_config.username'), { target: { value: 'n9e' } });
  fireEvent.change(screen.getByLabelText('bark_request_config.password'), { target: { value: ' ' } });
  expect(await validate()).toEqual([]);
  expect(normalizeFormValues(form.getFieldsValue()).request_config.bark_request_config).toMatchObject({ username: 'n9e', password: ' ' });
});

it('does not block other media types with hidden Bark fields', async () => {
  render(<Editor initialValues={{ request_type: 'ntfy', request_config: { bark_request_config: { username: 'only-user', server_url: 'bad' } } }} />);
  expect(await validate()).toEqual([]);
});
