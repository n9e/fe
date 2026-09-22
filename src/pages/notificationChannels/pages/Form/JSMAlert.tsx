import React from 'react';
import { Alert, Collapse, Form, Input, InputNumber, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

const names = ['request_config', 'jsm_alert_request_config'];

/**
 * JSM 告警媒介只有接口地址和网络设置：API 集成的 key 决定告警归哪个团队，所以跟 Discord 的
 * Webhook 地址一样在通知规则里填。字段都不设 initialValue，原因见 Jira.tsx。
 */
export default function JSMAlert() {
  const { t } = useTranslation(NS);
  const request_type = Form.useWatch('request_type');

  return (
    <div style={{ display: request_type === 'jsm_alert' ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('jsm_alert_request_config.top_tip')} />
      <Form.Item
        label={t('jsm_alert_request_config.api_url')}
        tooltip={t('jsm_alert_request_config.api_url_tip')}
        name={[...names, 'api_url']}
        rules={[
          {
            validator: (_rule, value?: string) => {
              if (request_type !== 'jsm_alert' || !value || value.includes('{{') || /^https?:\/\//i.test(value.trim())) return Promise.resolve();
              return Promise.reject(new Error(t('jsm_alert_request_config.api_url_invalid')));
            },
          },
        ]}
      >
        <Input placeholder='https://api.atlassian.com' />
      </Form.Item>

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')} forceRender>
          <Form.Item label={t('http_request_config.proxy')} tooltip={t('jsm_alert_request_config.proxy_tip')} name={[...names, 'proxy']}>
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
