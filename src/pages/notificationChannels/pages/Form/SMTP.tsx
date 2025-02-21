import React from 'react';
import { Row, Col, Form, Input, Switch, InputNumber, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../../constants';

export default function SMTP() {
  const { t } = useTranslation(NS);
  const names = ['smtp_request_config'];
  const paramConfigType = Form.useWatch(['param_config', 'param_type']);
  const request_type = Form.useWatch('request_type');
  const isRequired = paramConfigType !== 'flashduty' && request_type === 'smtp';

  return (
    <div
      style={{
        display: request_type === 'smtp' ? 'block' : 'none',
      }}
    >
      <Row gutter={SIZE}>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.host')} name={[...names, 'host']} rules={[{ required: isRequired }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.port')} name={[...names, 'port']} rules={[{ required: isRequired }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.username')} name={[...names, 'username']} rules={[{ required: isRequired }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.password')} name={[...names, 'password']} rules={[{ required: isRequired }]}>
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.from')} name={[...names, 'from']} rules={[{ required: isRequired }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space>
            <Form.Item label={t('smtp_request_config.insecure_skip_verify')} name={[...names, 'insecure_skip_verify']} valuePropName='checked' rules={[{ required: isRequired }]}>
              <Switch />
            </Form.Item>
            <Form.Item label={t('smtp_request_config.batch')} name={[...names, 'batch']} rules={[{ required: isRequired }]}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
