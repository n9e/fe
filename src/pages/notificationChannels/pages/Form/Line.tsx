import React from 'react';
import { Alert, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';

const names = ['request_config', 'line_request_config'];

/** LINE 媒介放官方账号的 Channel Access Token；接收方（用户 / 群组的 ID）在通知规则里填。 */
export default function Line() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const active = requestType === 'line';
  const label = (key: string) => t(`line_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <Form.Item
        label={label('channel_access_token')}
        tooltip={label('channel_access_token_tip')}
        name={[...names, 'channel_access_token']}
        rules={[{ required: active, whitespace: true }]}
      >
        <Input.Password autoComplete='new-password' />
      </Form.Item>
      <NativeNetworkSettings names={names} proxyTip={label('proxy_tip')} extra={<NativeApiUrl name={[...names, 'api_url']} defaultUrl='https://api.line.me' active={active} />} />
    </div>
  );
}
