import React from 'react';
import { Form, Input, InputNumber, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import ContactKeysSelect from './ContactKeysSelect';

export default function FeishuApp() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'feishuapp_request_config'];
  const httpRquestConfigNames = ['request_config', 'http_request_config'];
  const request_type = Form.useWatch('request_type');
  const isRequired = request_type === 'feishuapp';

  return (
    <div
      style={{
        display: request_type === 'feishuapp' ? 'block' : 'none',
      }}
    >
      <Form.Item label={t('feishuapp_request_config.app_id')} name={[...names, 'app_id']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('feishuapp_request_config.app_secret')} name={[...names, 'app_secret']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('feishuapp_request_config.receive_id_type')} name={[...names, 'receive_id_type']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <ContactKeysSelect showSearch optionFilterProp='label' allowClear namePath={names} />

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')}>
          <Form.Item label={t('feishuapp_request_config.proxy')} name={[...names, 'proxy']}>
            <Input />
          </Form.Item>
          <Form.Item label={t('http_request_config.timeout')} name={[...httpRquestConfigNames, 'timeout']} initialValue={10000}>
            <InputNumber min={1} className='w-full' />
          </Form.Item>
          <Form.Item label={t('http_request_config.retry_times')} name={[...httpRquestConfigNames, 'retry_times']} initialValue={3}>
            <InputNumber min={0} className='w-full' />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
