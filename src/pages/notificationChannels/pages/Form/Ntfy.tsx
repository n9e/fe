import React from 'react';
import { Alert, Form, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';
import SeverityMap from './SeverityMap';

const names = ['request_config', 'ntfy_request_config'];

// 与后端 ntfyDefaultPriority 一致。级别名称是 ntfy 自己的叫法，与它的 App 里一致，不翻译
const DEFAULT_PRIORITY: Record<string, number> = { '1': 5, '2': 4, '3': 3 };
const PRIORITY_OPTIONS = [
  { label: '5 · Max', value: 5 },
  { label: '4 · High', value: 4 },
  { label: '3 · Default', value: 3 },
  { label: '2 · Low', value: 2 },
  { label: '1 · Min', value: 1 },
];

/** ntfy 媒介放服务地址、认证和级别到优先级的映射，全部可以留空（公共服务 ntfy.sh）；Topic 在通知规则里填。 */
export default function Ntfy() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const active = requestType === 'ntfy';
  const label = (key: string) => t(`ntfy_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <NativeApiUrl name={[...names, 'server_url']} defaultUrl='https://ntfy.sh' active={active} label={label('server_url')} tip={label('server_url_tip')} />
      <Form.Item
        label={label('token')}
        tooltip={label('token_tip')}
        name={[...names, 'token']}
        dependencies={[[...names, 'username']]}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, v?: string) =>
              !active || !v?.trim() || !getFieldValue([...names, 'username'])?.trim() ? Promise.resolve() : Promise.reject(new Error(label('auth_conflict'))),
          }),
        ]}
      >
        <Input.Password autoComplete='new-password' placeholder='tk_...' />
      </Form.Item>
      <Space align='start'>
        <Form.Item
          label={label('username')}
          name={[...names, 'username']}
          dependencies={[[...names, 'password']]}
          rules={[
            ({ getFieldValue }) => ({
              validator: (_, v?: string) =>
                !active || !!v?.trim() === !!getFieldValue([...names, 'password'])?.trim() ? Promise.resolve() : Promise.reject(new Error(label('basic_incomplete'))),
            }),
          ]}
        >
          <Input autoComplete='off' />
        </Form.Item>
        <Form.Item label={label('password')} name={[...names, 'password']}>
          <Input.Password autoComplete='new-password' />
        </Form.Item>
      </Space>
      <SeverityMap name={[...names, 'priority_map']} label={label('priority_map')} tooltip={label('priority_map_tip')} options={PRIORITY_OPTIONS} defaults={DEFAULT_PRIORITY} />
      <NativeNetworkSettings names={names} proxyTip={label('proxy_tip')} insecureTip={label('insecure_tip')} />
    </div>
  );
}
