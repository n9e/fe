/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { act, fireEvent, render, screen } from '@testing-library/react';

import request from '@/utils/request';
import AuthMethod from './AuthMethod';
import BasicAuth from './BasicAuth';
import PluginBasicAuth from '../itemsNG/BasicAuth';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/store/common', () => ({ RequestMethod: { Get: 'GET' } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let form: FormInstance;

function Editor({ initialValues = {}, plugin = false }: { initialValues?: Record<string, unknown>; plugin?: boolean }) {
  const [instance] = Form.useForm();
  form = instance;
  return (
    <Form form={instance} initialValues={initialValues}>
      <AuthMethod types={['basic', 'sigv4', 'oauth2', 'azure']} basic={plugin ? <PluginBasicAuth cate='os' hideTitle /> : <BasicAuth hideTitle />} />
      {plugin && <PluginBasicAuth cate='os' showTls hideTitle showFields={false} />}
    </Form>
  );
}

beforeEach(() => {
  jest.mocked(request).mockResolvedValue({
    data: { allow_ambient_credentials: false, allow_assume_role: false, sigv4_allowed_services: ['aps', 'es'] },
  });
});

it('preserves legacy Basic credentials while switching auth methods and validates only the active fields', async () => {
  await act(async () => {
    render(<Editor initialValues={{ auth: { basic_auth_user: 'legacy-user', basic_auth_password: 'legacy-pass' } }} />);
  });
  expect(screen.getByLabelText('form.username')).toHaveValue('legacy-user');
  fireEvent.click(screen.getByLabelText('AWS SigV4'));
  expect(screen.getByLabelText('Access Key')).toBeChecked();
  fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'us-east-1' } });
  fireEvent.change(screen.getByLabelText('Access Key ID'), { target: { value: 'AKID' } });
  fireEvent.change(screen.getByLabelText('Secret Access Key'), { target: { value: 'secret' } });
  await act(async () => {
    await expect(form.validateFields()).resolves.toMatchObject({ auth: { type: 'sigv4' } });
  });
  fireEvent.click(screen.getByLabelText('OAuth2'));
  fireEvent.click(screen.getByLabelText('Basic Auth'));
  expect(screen.getByLabelText('form.username')).toHaveValue('legacy-user');
  expect(screen.getByLabelText('form.password')).toHaveValue('legacy-pass');
  await act(async () => {
    await expect(form.validateFields()).resolves.toMatchObject({ auth: { type: 'basic' } });
  });
  fireEvent.click(screen.getByLabelText('AWS SigV4'));
  expect(screen.getByLabelText('Access Key ID')).toHaveValue('AKID');
});

it('honors the server policy for AWS and Azure ambient identities and AssumeRole', async () => {
  await act(async () => {
    render(<Editor />);
  });
  fireEvent.click(screen.getByLabelText('AWS SigV4'));
  expect(screen.getByLabelText('form.cloud_auth.aws_default_chain')).toBeDisabled();
  expect(screen.getByLabelText('Assume Role ARN')).toBeDisabled();
  fireEvent.click(screen.getByLabelText('Azure Entra ID'));
  expect(screen.getByLabelText('Managed Identity')).toBeDisabled();
  expect(screen.getByLabelText('Workload Identity')).toBeDisabled();
  expect(screen.getByLabelText('form.cloud_auth.azure_client_secret')).toBeChecked();
});

it('keeps OAuth2 endpoint parameters editable after loading and clearing a form value', async () => {
  await act(async () => {
    render(<Editor initialValues={{ auth: { type: 'oauth2', oauth2: { endpoint_params: { audience: 'old' } } } }} />);
  });
  expect(screen.getByPlaceholderText('form.cloud_auth.param_value')).toHaveValue('old');
  await act(async () => {
    form.setFieldsValue({ auth: { oauth2: { endpoint_params: { audience: 'loaded' } } } });
  });
  expect(screen.getByPlaceholderText('form.cloud_auth.param_value')).toHaveValue('loaded');
  fireEvent.change(screen.getByPlaceholderText('form.cloud_auth.param_value'), { target: { value: 'edited' } });
  expect(form.getFieldValue(['auth', 'oauth2', 'endpoint_params'])).toEqual({ audience: 'edited' });
  await act(async () => {
    form.setFieldsValue({ auth: { oauth2: { endpoint_params: undefined } } });
  });
  expect(screen.queryByPlaceholderText('form.cloud_auth.param_key')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /form.cloud_auth.add_param/ }));
  fireEvent.change(screen.getByPlaceholderText('form.cloud_auth.param_key'), { target: { value: 'audience' } });
  fireEvent.change(screen.getByPlaceholderText('form.cloud_auth.param_value'), { target: { value: 'new' } });
  expect(form.getFieldValue(['auth', 'oauth2', 'endpoint_params'])).toEqual({ audience: 'new' });
});

it('restores saved cloud credentials and keeps OpenSearch TLS available on every auth tab', async () => {
  await act(async () => {
    render(
      <Editor
        plugin
        initialValues={{
          auth: { type: 'sigv4', sigv4: { region: 'eu-west-1', credential_type: 'keys', access_key: 'saved-key', secret_key: 'saved-secret' } },
          settings: { 'os.basic': { 'os.user': 'old-user' }, 'os.tls': { 'os.tls.skip_tls_verify': true } },
        }}
      />,
    );
  });
  expect(screen.getByLabelText('Region')).toHaveValue('eu-west-1');
  expect(screen.getByLabelText('Access Key ID')).toHaveValue('saved-key');
  expect(screen.getByRole('switch')).toBeChecked();
  fireEvent.click(screen.getByLabelText('OAuth2'));
  expect(screen.getByRole('switch')).toBeChecked();
  fireEvent.click(screen.getByLabelText('Basic Auth'));
  expect(screen.getByLabelText('form.username')).toHaveValue('old-user');
  expect(screen.getByRole('switch')).toBeChecked();
});
