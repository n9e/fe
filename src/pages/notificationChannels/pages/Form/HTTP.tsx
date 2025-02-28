import React from 'react';
import _ from 'lodash';
import { Form, Row, Col, Input, Select, Space, InputNumber, Switch, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../../constants';

export default function HTTP() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'http_request_config'];
  const request_type = Form.useWatch('request_type');
  const method = Form.useWatch([...names, 'method']);
  const isRequired = request_type === 'http';

  return (
    <div
      style={{
        display: request_type === 'http' ? 'block' : 'none',
      }}
    >
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Row gutter={SIZE}>
            <Col span={12}>
              <Form.Item label={t('http_request_config.url')} tooltip={t('http_request_config.url_tip')} name={[...names, 'url']} rules={[{ required: isRequired }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('http_request_config.method')} name={[...names, 'method']} rules={[{ required: isRequired }]}>
                <Select
                  options={[
                    {
                      label: 'GET',
                      value: 'GET',
                    },
                    {
                      label: 'POST',
                      value: 'POST',
                    },
                    {
                      label: 'PUT',
                      value: 'PUT',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col flex='none'>
          <div style={{ width: 12 }} />
        </Col>
      </Row>
      <Form.List name={[...names, 'headers']}>
        {(fields, { add, remove }) => (
          <>
            <div className='mb1'>
              <Space size={4}>
                {t('http_request_config.header')}
                <Tooltip className='n9e-ant-from-item-tooltip' title={t('http_request_config.header_tip')}>
                  <QuestionCircleOutlined />
                </Tooltip>
                <PlusCircleOutlined onClick={() => add()} />
              </Space>
            </div>
            {fields.length > 0 && (
              <Row gutter={SIZE} className='mb1'>
                <Col flex='auto'>
                  <Row gutter={SIZE}>
                    <Col span={12}>{t('http_request_config.header_key')}</Col>
                    <Col span={12}>{t('http_request_config.header_value')}</Col>
                  </Row>
                </Col>
                <Col flex='none'>
                  <div style={{ width: 12 }} />
                </Col>
              </Row>
            )}
            {fields.map(({ key, name, ...restField }) => (
              <Row gutter={SIZE} key={key}>
                <Col flex='auto'>
                  <Row gutter={SIZE}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'key']}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'value']}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col flex='none'>
                  <MinusCircleOutlined className='mt1' onClick={() => remove(name)} />
                </Col>
              </Row>
            ))}
          </>
        )}
      </Form.List>
      <Form.Item label={t('http_request_config.timeout')} name={[...names, 'timeout']}>
        <InputNumber min={0} />
      </Form.Item>
      <Space>
        <Form.Item label={t('http_request_config.concurrency')} name={[...names, 'concurrency']}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label={t('http_request_config.retry_times')} name={[...names, 'retry_times']}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label={t('http_request_config.retry_interval')} name={[...names, 'retry_interval']}>
          <InputNumber min={0} />
        </Form.Item>
      </Space>
      <Form.Item label={t('http_request_config.insecure_skip_verify')} name={[...names, 'insecure_skip_verify']} valuePropName='checked'>
        <Switch />
      </Form.Item>
      <Form.Item label={t('http_request_config.proxy')} tooltip={t('http_request_config.proxy_tip')} name={[...names, 'proxy']}>
        <Input />
      </Form.Item>
      <Form.List name={[...names, 'request', 'parameters']}>
        {(fields, { add, remove }) => (
          <>
            <div className='mb1'>
              <Space size={4}>
                {t('http_request_config.params')}
                <PlusCircleOutlined onClick={() => add()} />
              </Space>
            </div>
            {fields.length > 0 && (
              <Row gutter={SIZE} className='mb1'>
                <Col flex='auto'>
                  <Row gutter={SIZE}>
                    <Col span={12}>{t('http_request_config.params_key')}</Col>
                    <Col span={12}>{t('http_request_config.params_value')}</Col>
                  </Row>
                </Col>
                <Col flex='none'>
                  <div style={{ width: 12 }} />
                </Col>
              </Row>
            )}
            {fields.map(({ key, name, ...restField }) => (
              <Row gutter={SIZE} key={key}>
                <Col flex='auto'>
                  <Row gutter={SIZE}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'key']}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'value']}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col flex='none'>
                  <MinusCircleOutlined className='mt1' onClick={() => remove(name)} />
                </Col>
              </Row>
            ))}
          </>
        )}
      </Form.List>
      {_.includes(['POST', 'PUT'], method) && (
        <Form.Item label={t('http_request_config.body')} name={[...names, 'request', 'body']} rules={[{ required: isRequired }]}>
          <Input.TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>
      )}
    </div>
  );
}
