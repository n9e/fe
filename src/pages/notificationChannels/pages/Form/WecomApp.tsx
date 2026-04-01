import React from 'react';
import { Form, Input, InputNumber, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import ContactKeysSelect from './ContactKeysSelect';

export default function WecomApp() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'wecomapp_request_config'];
  const httpRquestConfigNames = ['request_config', 'http_request_config'];
  const request_type = Form.useWatch('request_type');
  const isRequired = request_type === 'wecomapp';

  return (
    <div
      style={{
        display: request_type === 'wecomapp' ? 'block' : 'none',
      }}
    >
      <Form.Item label={t('wecomapp_request_config.corp_id')} name={[...names, 'corp_id']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('wecomapp_request_config.corp_secret')} name={[...names, 'corp_secret']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('wecomapp_request_config.agentid')} name={[...names, 'agentid']} rules={[{ required: isRequired }]}>
        <Input />
      </Form.Item>
      <ContactKeysSelect showSearch optionFilterProp='label' allowClear namePath={names} />

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')}>
          <Form.Item label={t('wecomapp_request_config.proxy')} name={[...names, 'proxy']}>
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
