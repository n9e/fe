import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Input, Space, InputNumber, Switch } from 'antd';
import { DownOutlined, MinusCircleOutlined, PlusCircleOutlined, RightOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import classnames from 'classnames';

import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
}

export default function Callback(props: Props) {
  const { t } = useTranslation(NS);
  const { field, namePath = [] } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);

  return (
    <>
      <Form.Item {...resetField} label={t('callback.url')} name={[...namePath, 'url']} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <div className='mb-4'>
        <div className='flex items-center cursor-pointer mb-2' onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}>
          <span className='text-sm pr-1'>{t('callback.advanced_settings')}</span>
          {isAdvancedVisible ? <DownOutlined /> : <RightOutlined />}
        </div>

        <div
          className={classnames({
            'p-4 border-t border-solid border-[var(--fc-border-color)]': true,
            hidden: !isAdvancedVisible,
          })}
        >
          <div className='space-y-4'>
            <Row gutter={10} className='mb-3'>
              <Col flex='auto'>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item {...resetField} label={t('callback.basic_auth_user')} name={[...namePath, 'basic_auth_user']} className='mb-0 flex-1'>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item {...resetField} label={t('callback.basic_auth_pass')} name={[...namePath, 'basic_auth_pass']} className='mb-0 flex-1'>
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col flex='none'>
                <div className='w-3' />
              </Col>
            </Row>

            <Form.List name={[...namePath, 'header']}>
              {(fields, { add, remove }) => (
                <div className='mb-4'>
                  <div className='mb-3'>
                    <Space size={4}>
                      <span className='text-sm'>HTTP Headers</span>
                      <PlusCircleOutlined onClick={() => add({ key: '', value: '' })} />
                    </Space>
                  </div>
                  {fields.length > 0 && (
                    <Row gutter={10} className='mb-3'>
                      <Col flex='auto'>
                        <Row gutter={10}>
                          <Col span={12}>Header Key</Col>
                          <Col span={12}>Header Value</Col>
                        </Row>
                      </Col>
                      <Col flex='none'>
                        <div className='w-3' />
                      </Col>
                    </Row>
                  )}
                  <div className='space-y-3'>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={10} key={key} className='mb-2'>
                        <Col flex='auto'>
                          <Row gutter={10}>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'key']} className='mb-0'>
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'value']} className='mb-0'>
                                <Input />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col flex='none'>
                          <MinusCircleOutlined className='mt-2' onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              )}
            </Form.List>
            <Row gutter={10} className='mb-3'>
              <Col flex='auto'>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item {...resetField} className='mb-0' label='HTTP Proxy' name={[...namePath, 'proxy']}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...resetField}
                      label='Callback Timeout'
                      name={[...namePath, 'timeout']}
                      getValueFromEvent={(value) => Number(value)}
                      getValueProps={(value) => ({ value: Number(value) })}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} addonAfter='ms' />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...resetField} label='TLS InsecureSkipVerify' name={[...namePath, 'insecure_skip_verify']} valuePropName='checked'>
                      <Switch size='small' />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col flex='none'>
                <div className='w-3' />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}
