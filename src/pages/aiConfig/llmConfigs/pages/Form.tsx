import React from 'react';
import { Form, Row, Col, Input, Select, Switch, InputNumber, Button, Collapse } from 'antd';
import { FormInstance } from 'antd/es/form';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../constants';
import './style.less';

interface Props {
  form: FormInstance;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form } = props;

  return (
    <Form form={form} layout='vertical'>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input placeholder={t('form.name_placeholder')} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('enabled')} name='enabled' valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('is_default')} tooltip={t('is_default_tip')} name='is_default' valuePropName='checked' initialValue={false}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('description')} name='description'>
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder={t('form.description_placeholder')} />
      </Form.Item>
      <Row gutter={SIZE}>
        <Col span={12}>
          <Form.Item label={t('api_type')} name='api_type' rules={[{ required: true }]} initialValue='openai'>
            <Select
              options={[
                {
                  label: t('form.api_type_map.openai'),
                  value: 'openai',
                },
                {
                  label: t('form.api_type_map.claude'),
                  value: 'claude',
                },
                {
                  label: t('form.api_type_map.gemini'),
                  value: 'gemini',
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('model')} name='model' rules={[{ required: true }]}>
            <Input placeholder={t('form.model_placeholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('form.api_url')} name='api_url' rules={[{ required: true }]}>
        <Input placeholder={t('form.api_url_placeholder')} />
      </Form.Item>
      <Form.Item label={t('form.api_key')} name='api_key' rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Collapse ghost className='llmconfig-form-collapse'>
        <Collapse.Panel key='advanced' header={t('form.advanced_settings')}>
          <Row gutter={SIZE}>
            <Col flex='auto'>
              <Form.Item label={t('form.timeout_seconds')} tooltip={t('form.timeout_seconds_tip')} name={['extra_config', 'timeout_seconds']}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder={t('form.timeout_seconds_placeholder')} />
              </Form.Item>
            </Col>
            <Col flex='none'>
              <Form.Item label={t('form.skip_tls_verify')} tooltip={t('form.skip_tls_verify_tip')} name={['extra_config', 'skip_tls_verify']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t('form.proxy')} tooltip={t('form.proxy_tip')} name={['extra_config', 'proxy']}>
            <Input placeholder={t('form.proxy_placeholder')} />
          </Form.Item>
          <Form.Item label={t('form.custom_headers')}>
            <Form.List name={['extra_config', 'custom_headers']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={SIZE}>
                      <Col flex='auto'>
                        <Row gutter={SIZE}>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: '' }]}>
                              <Input placeholder={t('form.custom_headers_key')} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: '' }]}>
                              <Input placeholder={t('form.custom_headers_value')} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex='none'>
                        <Button type='text' onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                      </Col>
                    </Row>
                  ))}
                  <Button className='w-full' type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                    {t('form.add_header')}
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            label={t('form.custom_params')}
            tooltip={t('form.custom_params_tip')}
            name={['extra_config', 'custom_params']}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error(t('form.custom_params_invalid_json')));
                  }
                },
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder='{"key": "value"}' />
          </Form.Item>
          <Row gutter={SIZE}>
            <Col span={8}>
              <Form.Item label={t('form.temperature')} tooltip={t('form.temperature_tip')} name={['extra_config', 'temperature']}>
                <InputNumber style={{ width: '100%' }} min={0} max={2} step={0.1} placeholder={t('form.temperature_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('form.max_tokens')} tooltip={t('form.max_tokens_tip')} name={['extra_config', 'max_tokens']}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder={t('form.max_tokens_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('form.context_length')} tooltip={t('form.context_length_tip')} name={['extra_config', 'context_length']}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder={t('form.context_length_placeholder')} />
              </Form.Item>
            </Col>
          </Row>
        </Collapse.Panel>
      </Collapse>
    </Form>
  );
}
