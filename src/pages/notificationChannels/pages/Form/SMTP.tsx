import React from 'react';
import { Row, Col, Form, Input, Switch, InputNumber, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../../constants';

export default function SMTP() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'smtp_request_config'];
  const request_type = Form.useWatch('request_type');
  const isRequired = request_type === 'smtp';

  return (
    <div
      style={{
        display: request_type === 'smtp' ? 'block' : 'none',
      }}
    >
      <Row gutter={SIZE}>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.host')} tooltip={t('smtp_request_config.host_tip')} name={[...names, 'host']} rules={[{ required: isRequired }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.port')} tooltip={t('smtp_request_config.port_tip')} name={[...names, 'port']} rules={[{ required: isRequired }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.username')} tooltip={t('smtp_request_config.username_tip')} name={[...names, 'username']} rules={[{ required: isRequired }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('smtp_request_config.password')} tooltip={t('smtp_request_config.password_tip')} name={[...names, 'password']} rules={[{ required: isRequired }]}>
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <Space size={4}>
                {t('smtp_request_config.from')}
                <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-400' title={t('smtp_request_config.from_tip')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            name={[...names, 'from']}
            rules={[{ required: isRequired }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space>
            <Form.Item
              label={t('smtp_request_config.insecure_skip_verify')}
              tooltip={t('smtp_request_config.insecure_skip_verify_tip')}
              name={[...names, 'insecure_skip_verify']}
              valuePropName='checked'
              rules={[{ required: isRequired }]}
            >
              <Switch />
            </Form.Item>
            <Form.Item label={t('smtp_request_config.batch')} tooltip={t('smtp_request_config.batch_tip')} name={[...names, 'batch']} rules={[{ required: isRequired }]}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
