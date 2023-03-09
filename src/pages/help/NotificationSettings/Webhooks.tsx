import React, { useEffect } from 'react';
import { Alert, Form, Input, Switch, Button, Space, InputNumber, Row, Col, message } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { getWebhooks, putWebhooks } from './services';

export default function Webhooks() {
  const { t } = useTranslation('notificationSettings');
  const [form] = Form.useForm();

  useEffect(() => {
    getWebhooks().then((res) => {
      form.setFieldsValue({
        webhooks: _.map(res, (item) => {
          return {
            ...item,
            headers: _.map(item.headers, (value, key) => {
              return {
                key,
                value,
              };
            }),
          };
        }),
      });
    });
  }, []);

  return (
    <div className='webhooks-container'>
      <div className='webhooks-content'>
        <Form form={form} layout='vertical'>
          <Form.List name='webhooks'>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, idx) => (
                    <div className='webhook-item' key={field.key}>
                      <div style={{ marginBottom: 10 }}>
                        <Space align='baseline'>
                          {t('webhooks.enable')}
                          <Form.Item {...field} name={[field.name, 'enable']} valuePropName='checked' noStyle>
                            <Switch />
                          </Form.Item>
                        </Space>
                      </div>
                      <Form.Item {...field} label={t('webhooks.note')} name={[field.name, 'note']}>
                        <Input />
                      </Form.Item>
                      <Form.Item {...field} label={t('webhooks.url')} name={[field.name, 'url']} rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item {...field} label={t('webhooks.timeout')} name={[field.name, 'timeout']}>
                        <InputNumber style={{ width: '100%' }} />
                      </Form.Item>
                      <Row gutter={10}>
                        <Col span={12}>
                          <Form.Item {...field} label={t('webhooks.basic_auth_user')} name={[field.name, 'basic_auth_user']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...field} label={t('webhooks.basic_auth_password')} name={[field.name, 'basic_auth_pass']}>
                            <Input.Password />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.List {...field} name={[field.name, 'headers']}>
                        {(headers, { add, remove }) => {
                          return (
                            <div>
                              <div>
                                Headers{' '}
                                <PlusCircleOutlined
                                  onClick={() => {
                                    add();
                                  }}
                                />
                              </div>
                              {headers.length > 0 ? (
                                <Row gutter={10}>
                                  <Col flex='auto'>
                                    <Row gutter={10}>
                                      <Col span={12}>Header</Col>
                                      <Col span={12}>Value</Col>
                                    </Row>
                                  </Col>
                                  <Col flex='32px'></Col>
                                </Row>
                              ) : (
                                <div style={{ marginBottom: 10 }} />
                              )}
                              {headers.map((header, idx) => (
                                <Row gutter={10} key={header.key}>
                                  <Col flex='auto'>
                                    <Row gutter={10}>
                                      <Col span={12}>
                                        <Form.Item {...header} name={[header.name, 'key']}>
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                      <Col span={12}>
                                        <Form.Item {...header} name={[header.name, 'value']}>
                                          <Input />
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col flex='32px'>
                                    <MinusCircleOutlined
                                      style={{ marginTop: 8 }}
                                      onClick={() => {
                                        remove(header.name);
                                      }}
                                    />
                                  </Col>
                                </Row>
                              ))}
                            </div>
                          );
                        }}
                      </Form.List>
                      <Space align='baseline'>
                        {t('webhooks.skip_verify')}
                        <Form.Item {...field} name={[field.name, 'skip_verify']} noStyle>
                          <Switch />
                        </Form.Item>
                      </Space>
                      {fields.length > 1 && (
                        <div className='webhook-item-remove'>
                          <CloseOutlined
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    style={{ width: '100%' }}
                    onClick={() => {
                      add();
                    }}
                  >
                    {t('webhooks.add')}
                  </Button>
                </div>
              );
            }}
          </Form.List>
          <div style={{ marginTop: 16 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  const data = _.map(values.webhooks, (item) => {
                    return {
                      ...item,
                      headers: _.reduce(
                        item.headers,
                        (result, value) => {
                          result[value.key] = value.value;
                          return result;
                        },
                        {},
                      ),
                    };
                  });
                  putWebhooks(data).then(() => {
                    message.success(t('common:success.save'));
                  });
                });
              }}
            >
              {t('common:btn.save')}
            </Button>
          </div>
        </Form>
      </div>
      <div className='webhooks-doc'>
        <Alert
          type='info'
          message={
            <div>
              尊敬的夜莺老铁，您好，如果您想把夜莺告警事件全部转发到另一个平台处理，可以通过这里的全局回调地址来实现。
              <br />
              <br />
              近期快猫团队提供的事件OnCall产品FlashDuty也开始公测了，欢迎体验，把各个监控系统的告警事件统一推给FlashDuty，享受告警聚合降噪、排班、认领、升级、协同处理一站式体验。
              <br />
              <br />
              <a href='https://console.flashcat.cloud/?from=n9e' target='_blank'>
                免费体验地址
              </a>
            </div>
          }
        />
      </div>
    </div>
  );
}
