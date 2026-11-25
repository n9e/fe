import React from 'react';
import { Alert, Form, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import ContactKeysSelect from './ContactKeysSelect';
import NativeNetworkSettings from './NativeNetworkSettings';
import NativeApiUrl from './NativeApiUrl';

const names = ['request_config', 'bark_request_config'];

/** Bark 媒介放服务地址和认证，全部可以留空（公共服务 api.day.app）；Device Key 跟着人走，每个人在个人信息的联系方式里填。 */
export default function Bark() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  const active = requestType === 'bark';
  const label = (key: string) => t(`bark_request_config.${key}`);

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={label('top_tip')} />
      <ContactKeysSelect showSearch optionFilterProp='label' />
      <NativeApiUrl name={[...names, 'server_url']} defaultUrl='https://api.day.app' active={active} label={label('server_url')} tip={label('server_url_tip')} />
      <Space align='start'>
        <Form.Item
          label={label('username')}
          tooltip={label('username_tip')}
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
      <Space align='start'>
        <Form.Item label={label('sound')} tooltip={label('sound_tip')} name={[...names, 'sound']}>
          <Input placeholder='alarm' />
        </Form.Item>
        <Form.Item label={label('group')} tooltip={label('group_tip')} name={[...names, 'group']}>
          <Input placeholder='Nightingale' />
        </Form.Item>
      </Space>
      <NativeNetworkSettings names={names} proxyTip={label('proxy_tip')} insecureTip={label('insecure_tip')} />
    </div>
  );
}
