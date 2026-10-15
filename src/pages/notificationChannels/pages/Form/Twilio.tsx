import React from 'react';
import { Alert, Form, Input, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';

const names = ['request_config', 'twilio_request_config'];
const isVarRef = (v?: string) => !!v?.includes('{{');

export default function Twilio() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const mode = Form.useWatch([...names, 'mode']);
  const active = requestType === 'twilio';
  const voice = mode === 'voice';
  const label = (key: string) => t(`twilio_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <Form.Item label={label('mode')} name={[...names, 'mode']}>
        <Radio.Group
          options={[
            { label: label('sms'), value: 'sms' },
            { label: label('call'), value: 'voice' },
          ]}
        />
      </Form.Item>
      <Form.Item
        label={label('account_sid')}
        name={[...names, 'account_sid']}
        rules={[
          { required: active, whitespace: true },
          {
            validator: (_, v) =>
              !active || !v || isVarRef(v) || /^AC[0-9a-fA-F]{32}$/.test(v.trim()) ? Promise.resolve() : Promise.reject(new Error(label('account_sid_invalid'))),
          },
        ]}
      >
        <Input placeholder='AC...' />
      </Form.Item>
      <Form.Item label={label('auth_token')} name={[...names, 'auth_token']} rules={[{ required: active, whitespace: true }]}>
        <Input.Password autoComplete='new-password' />
      </Form.Item>
      <Form.Item
        label={label('from')}
        tooltip={label('from_tip')}
        name={[...names, 'from']}
        dependencies={[
          [...names, 'messaging_service_sid'],
          [...names, 'mode'],
        ]}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, v?: string) => {
              if (!active) return Promise.resolve();
              if (!v?.trim() && (voice || !getFieldValue([...names, 'messaging_service_sid'])?.trim())) return Promise.reject(new Error(label('from_required')));
              if (voice && v && !isVarRef(v) && !/^\+[1-9][0-9]{1,14}$/.test(v.trim())) return Promise.reject(new Error(label('phone_format')));
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input placeholder='+14155552671' />
      </Form.Item>
      <Form.Item
        hidden={voice}
        label={label('messaging_service_sid')}
        name={[...names, 'messaging_service_sid']}
        rules={[
          {
            validator: (_, v) =>
              !active || voice || !v || isVarRef(v) || /^MG[0-9a-fA-F]{32}$/.test(v.trim()) ? Promise.resolve() : Promise.reject(new Error(label('service_sid_invalid'))),
          },
        ]}
      >
        <Input placeholder='MG...' />
      </Form.Item>
      <Form.Item hidden={!voice} label={label('voice')} name={[...names, 'voice']}>
        <Input placeholder='woman' />
      </Form.Item>
      <Form.Item hidden={!voice} label={label('language')} name={[...names, 'language']}>
        <Input placeholder='en-US' />
      </Form.Item>
      <Alert className='mb-4' type='info' showIcon message={label('retry_tip')} />
      <NativeNetworkSettings names={names} proxyTip={label('proxy_tip')} />
    </div>
  );
}
