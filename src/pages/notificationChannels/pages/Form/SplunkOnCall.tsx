import React from 'react';
import { Alert, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';

const names = ['request_config', 'splunk_oncall_request_config'];

/** Splunk On-Call 媒介放 REST 集成的 API Key；Routing Key 决定告警归哪个团队，在通知规则里填。 */
export default function SplunkOnCall() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const active = requestType === 'splunk_oncall';
  const label = (key: string) => t(`splunk_oncall_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <Form.Item label={label('api_key')} tooltip={label('api_key_tip')} name={[...names, 'api_key']} rules={[{ required: active, whitespace: true }]}>
        <Input.Password autoComplete='new-password' />
      </Form.Item>
      <NativeNetworkSettings
        names={names}
        proxyTip={label('proxy_tip')}
        extra={<NativeApiUrl name={[...names, 'api_url']} defaultUrl='https://alert.victorops.com/integrations/generic/20131114/alert' active={active} />}
      />
    </div>
  );
}
