import React from 'react';
import { Alert, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';

const names = ['request_config', 'pushover_request_config'];
const isVarRef = (v?: string) => !!v?.includes('{{');

/** Pushover 媒介放应用的 API Token；收消息的 User Key / Group Key 在通知规则里填。 */
export default function Pushover() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const active = requestType === 'pushover';
  const label = (key: string) => t(`pushover_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <Form.Item
        label={label('token')}
        name={[...names, 'token']}
        rules={[
          { required: active, whitespace: true },
          {
            validator: (_, v?: string) =>
              !active || !v || isVarRef(v) || /^[A-Za-z0-9]{30}$/.test(v.trim()) ? Promise.resolve() : Promise.reject(new Error(label('token_invalid'))),
          },
        ]}
      >
        <Input.Password autoComplete='new-password' />
      </Form.Item>
      <Form.Item label={label('sound')} tooltip={label('sound_tip')} name={[...names, 'sound']}>
        <Input placeholder='pushover' />
      </Form.Item>
      <NativeNetworkSettings
        names={names}
        proxyTip={label('proxy_tip')}
        extra={<NativeApiUrl name={[...names, 'api_url']} defaultUrl='https://api.pushover.net' active={active} />}
      />
    </div>
  );
}
