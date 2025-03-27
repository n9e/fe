import React from 'react';
import { Form, Input, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
        label={
          <Space size={4}>
            {t('flashduty_request_config.integration_url')}
            <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t('flashduty_request_config.integration_url_tip')}>
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        }
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
