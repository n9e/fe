import React from 'react';
import { Alert, Collapse, Form, Input, InputNumber, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

const names = ['request_config', 'jsm_alert_request_config'];

// 与后端 models.JSMAlertRequestConfig.Priority 的默认值一致
const DEFAULT_PRIORITY: Record<string, string> = { '1': 'P1', '2': 'P2', '3': 'P3' };
const PRIORITY_OPTIONS = ['P1', 'P2', 'P3', 'P4', 'P5'].map((p) => ({ label: p, value: p }));

/**
 * JSM 告警媒介放接口地址、级别与优先级映射（JSM 的优先级全站固定，是组织级约定）和网络设置；
 * API 集成的 key 决定告警归哪个团队，所以跟 Discord 的
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
      <Form.Item label={t('jsm_alert_request_config.priority_map')} tooltip={t('jsm_alert_request_config.priority_map_tip')}>
        <Space wrap>
          {['1', '2', '3'].map((sev) => (
            <Space key={sev} size={4}>
              <span>S{sev}</span>
              <Form.Item noStyle name={[...names, 'priority_map', sev]} getValueProps={(v) => ({ value: v || DEFAULT_PRIORITY[sev] })}>
                <Select style={{ width: 90 }} options={PRIORITY_OPTIONS} />
              </Form.Item>
            </Space>
          ))}
        </Space>
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
