import React from 'react';
import { Alert, Form, Input, InputNumber, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';
import SeverityMap from './SeverityMap';

const names = ['request_config', 'pushover_request_config'];
const isVarRef = (v?: string) => !!v?.includes('{{');

// 与后端 pushoverDefaultPriority 一致。级别名称是 Pushover 自己的叫法，与它的 App 里一致，不翻译
const DEFAULT_PRIORITY: Record<string, number> = { '1': 1, '2': 0, '3': 0 };
const PRIORITY_OPTIONS = [
  { label: '2 · Emergency', value: 2 },
  { label: '1 · High', value: 1 },
  { label: '0 · Normal', value: 0 },
  { label: '-1 · Low', value: -1 },
  { label: '-2 · Lowest', value: -2 },
];

/** Pushover 媒介放应用的 API Token 和级别到优先级的映射；收消息的 User Key / Group Key 在通知规则里填。 */
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
      <SeverityMap name={[...names, 'priority_map']} label={label('priority_map')} tooltip={label('priority_map_tip')} options={PRIORITY_OPTIONS} defaults={DEFAULT_PRIORITY} />
      <Space align='start'>
        <Form.Item label={label('retry')} tooltip={label('emergency_tip')} name={[...names, 'retry']}>
          <InputNumber min={30} placeholder='60' className='w-full' />
        </Form.Item>
        <Form.Item label={label('expire')} tooltip={label('emergency_tip')} name={[...names, 'expire']}>
          <InputNumber min={30} max={10800} placeholder='3600' className='w-full' />
        </Form.Item>
        <Form.Item label={label('sound')} tooltip={label('sound_tip')} name={[...names, 'sound']}>
          <Input placeholder='pushover' />
        </Form.Item>
      </Space>
      <NativeNetworkSettings
        names={names}
        proxyTip={label('proxy_tip')}
        extra={<NativeApiUrl name={[...names, 'api_url']} defaultUrl='https://api.pushover.net' active={active} />}
      />
    </div>
  );
}
