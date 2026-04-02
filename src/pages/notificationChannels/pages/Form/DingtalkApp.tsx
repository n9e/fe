import React from 'react';
import { Form, Input, InputNumber, Collapse, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import ContactKeysSelect from './ContactKeysSelect';

export default function DingtalkApp() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'dingtalkapp_request_config'];
  const request_type = Form.useWatch('request_type');
  const isRequired = request_type === 'dingtalkapp';

  return (
    <div
      style={{
        display: request_type === 'dingtalkapp' ? 'block' : 'none',
      }}
    >
      <Form.Item label={t('dingtalkapp_request_config.app_key')} name={[...names, 'app_key']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('dingtalkapp_request_config.app_secret')} name={[...names, 'app_secret']} rules={[{ required: isRequired }]}>
        <Input.Password />
      </Form.Item>
      <ContactKeysSelect showSearch optionFilterProp='label' allowClear />

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')}>
          <Form.Item label={t('http_request_config.proxy')} name={[...names, 'proxy']}>
            <Input />
          </Form.Item>
          <Space>
            <Form.Item label={t('http_request_config.timeout')} name={[...names, 'timeout']} initialValue={10000}>
              <InputNumber min={1} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_times')} name={[...names, 'retry_times']} initialValue={3}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_interval')} name={[...names, 'retry_interval']} initialValue={3}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
          </Space>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
