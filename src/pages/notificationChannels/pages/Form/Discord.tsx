import React from 'react';
import { Alert, Collapse, Form, Input, InputNumber, Space, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

const names = ['request_config', 'discord_request_config'];

/**
 * Discord 媒介只有外观默认值和网络设置：Webhook 地址（一个地址对应一个频道）在通知规则里填，
 * 与钉钉机器人的 token 一样。字段都不设 initialValue，原因见 Jira.tsx。
 */
export default function Discord() {
  const { t } = useTranslation(NS);
  const request_type = Form.useWatch('request_type');

  return (
    <div style={{ display: request_type === 'discord' ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('discord_request_config.top_tip')} />
      <Form.Item label={t('discord_request_config.username')} tooltip={t('discord_request_config.username_tip')} name={[...names, 'username']}>
        <Input placeholder='Nightingale' />
      </Form.Item>
      <Form.Item
        label={t('discord_request_config.avatar_url')}
        tooltip={t('discord_request_config.avatar_url_tip')}
        name={[...names, 'avatar_url']}
        rules={[
          {
            validator: (_rule, value?: string) => {
              if (request_type !== 'discord' || !value || value.includes('{{') || /^https?:\/\//i.test(value.trim())) return Promise.resolve();
              return Promise.reject(new Error(t('discord_request_config.avatar_url_invalid')));
            },
          },
        ]}
      >
        <Input placeholder='https://example.com/logo.png' />
      </Form.Item>
      <Form.Item label={t('discord_request_config.silent')} tooltip={t('discord_request_config.silent_tip')} name={[...names, 'silent']} valuePropName='checked'>
        <Switch />
      </Form.Item>

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')} forceRender>
          <Form.Item label={t('http_request_config.proxy')} tooltip={t('discord_request_config.proxy_tip')} name={[...names, 'proxy']}>
            <Input placeholder='http://127.0.0.1:7890' />
          </Form.Item>
          <Space>
            <Form.Item label={t('http_request_config.timeout')} name={[...names, 'timeout']}>
              <InputNumber min={1} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_times')} name={[...names, 'retry_times']}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_interval')} name={[...names, 'retry_sleep']}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
          </Space>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
