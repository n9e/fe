import { useTranslation } from 'react-i18next';
import { NS } from '../../constants';
import { Form, Input, InputNumber, Select, Space, Tooltip } from 'antd';
import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function Plivo() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'plivo_request_config'];
  const request_type = Form.useWatch('request_type');
  const ident = Form.useWatch('ident');
  const isPlivo = request_type === 'plivo';
  const isVoice = ident === 'plivo-voice';

  return (
    <div
      style={{
        display: isPlivo ? 'block' : 'none',
      }}
    >
      <Form.Item label={t('plivo_request_config.auth_id')} name={[...names, 'auth_id']} rules={[{ required: isPlivo }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('plivo_request_config.auth_token')} name={[...names, 'auth_token']} rules={[{ required: isPlivo }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item
        label={
          <Space size={4}>
            {t('plivo_request_config.src_number')}
            <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t('plivo_request_config.src_number_tip')}>
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        }
        name={[...names, 'src_number']}
        rules={[{ required: isPlivo }]}
      >
        <Input />
      </Form.Item>
      {isVoice && (
        <Form.Item
          label={
            <Space size={4}>
              {t('plivo_request_config.answer_url')}
              <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t('plivo_request_config.answer_url_tip')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          name={[...names, 'answer_url']}
          rules={[{ required: isVoice }]}
        >
          <Input />
        </Form.Item>
      )}
      {isVoice && (
        <Form.Item
          label={
            <Space size={4}>
              {t('plivo_request_config.answer_method')}
              <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t('plivo_request_config.answer_method_tip')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          name={[...names, 'answer_method']}
        >
          <Select
            options={[
              { label: 'POST', value: 'POST' },
              { label: 'GET', value: 'GET' },
            ]}
          />
        </Form.Item>
      )}
      <Form.Item label={t('plivo_request_config.proxy')} tooltip={t('plivo_request_config.proxy_tip')} name={[...names, 'proxy']}>
        <Input />
      </Form.Item>
      <Form.Item label={t('plivo_request_config.timeout')} name={[...names, 'timeout']}>
        <InputNumber min={0} className='w-full' />
      </Form.Item>
      <Form.Item label={t('plivo_request_config.retry_times')} name={[...names, 'retry_times']}>
        <InputNumber min={1} className='w-full' />
      </Form.Item>
    </div>
  );
}
