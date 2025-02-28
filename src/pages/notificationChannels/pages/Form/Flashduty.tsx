import React from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

export default function Flashduty() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'flashduty_request_config'];
  const request_type = Form.useWatch('request_type');
  const isRequired = request_type === 'flashduty';

  return (
    <div
      style={{
        display: request_type === 'flashduty' ? 'block' : 'none',
      }}
    >
      <Form.Item
        label={t('flashduty_request_config.integration_url')}
        tooltip={t('flashduty_request_config.integration_url_tip')}
        name={[...names, 'integration_url']}
        rules={[{ required: isRequired }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={t('flashduty_request_config.proxy')} tooltip={t('flashduty_request_config.proxy_tip')} name={[...names, 'proxy']}>
        <Input />
      </Form.Item>
    </div>
  );
}
