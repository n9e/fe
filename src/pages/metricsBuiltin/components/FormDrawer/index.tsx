/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Col, Drawer, Form, Input, Row, Select, Space, Button, AutoComplete, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { postMetrics, putMetric } from '../../services';

interface Props {
  mode: 'add' | 'edit' | 'clone';
  title: string;
  children: React.ReactNode;
  typesList: string[];
  collectorsList: string[];
  initialValues?: any;
  onOk: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { mode, title, children, typesList, collectorsList, initialValues, onOk } = props;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <div
        onClick={() => {
          setOpen(true);
          form.setFieldsValue(initialValues);
        }}
      >
        {children}
      </div>
      {open && (
        <Drawer
          width={600}
          closable={false}
          title={title}
          destroyOnClose
          extra={
            <CloseOutlined
              onClick={() => {
                setOpen(false);
              }}
            />
          }
          onClose={() => {
            setOpen(false);
          }}
          visible={open}
          footer={
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form.submit();
                }}
              >
                {t('common:btn.submit')}
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setOpen(false);
                }}
              >
                {t('common:btn.cancel')}
              </Button>
            </Space>
          }
        >
          <Form
            layout='vertical'
            form={form}
            onFinish={(values) => {
              if (mode === 'add' || mode === 'clone') {
                postMetrics([_.omit(values, ['id', 'created_at', 'created_by', 'updated_at', 'updated_by'])]).then(() => {
                  if (mode === 'add') {
                    message.success(t('common:success.add'));
                  } else if (mode === 'clone') {
                    message.success(t('common:success.clone'));
                  }
                  form.resetFields();
                  setOpen(false);
                  onOk();
                });
              } else if (mode === 'edit') {
                putMetric(values).then(() => {
                  message.success(t('common:success.modify'));
                  form.resetFields();
                  setOpen(false);
                  onOk();
                });
              }
            }}
          >
            <Form.Item name='id' hidden>
              <div />
            </Form.Item>
            <Form.Item
              label={t('name')}
              name='name'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={t('typ')}
                  name='typ'
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AutoComplete
                    options={_.map(typesList, (item) => {
                      return {
                        label: item,
                        value: item,
                      };
                    })}
                    showSearch
                    optionFilterProp='label'
                    placeholder={t('typ')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('collector')}
                  name='collector'
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AutoComplete
                    options={_.map(collectorsList, (item) => {
                      return {
                        label: item,
                        value: item,
                      };
                    })}
                    showSearch
                    optionFilterProp='label'
                    placeholder={t('collector')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={t('expression')}
              name='expression'
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea autoSize />
            </Form.Item>
            <Form.Item label={t('unit')} name='unit' tooltip={t('unit_tip')}>
              <Select placeholder='SI prefixes' allowClear showSearch>
                <Select.Option value='none'>none</Select.Option>
                <Select.OptGroup label='Data'>
                  <Select.Option value='bitsSI'>
                    bits(SI)<span className='built-in-metrics-form-unit-option-desc'>{t('bitsSI')}</span>
                  </Select.Option>
                  <Select.Option value='bytesSI'>
                    bytes(SI)<span className='built-in-metrics-form-unit-option-desc'>{t('bytesSI')}</span>
                  </Select.Option>
                  <Select.Option value='bitsIEC'>
                    bits(IEC)<span className='built-in-metrics-form-unit-option-desc'>{t('bitsIEC')}</span>
                  </Select.Option>
                  <Select.Option value='bytesIEC'>
                    bytes(IEC)<span className='built-in-metrics-form-unit-option-desc'>{t('bytesIEC')}</span>
                  </Select.Option>
                </Select.OptGroup>
                <Select.OptGroup label='Data rate'>
                  <Select.Option value='packetsSec'>
                    packets/sec<span className='built-in-metrics-form-unit-option-desc'>{t('packetsSec')}</span>
                  </Select.Option>
                  <Select.Option value='bitsSecSI'>
                    bits/sec(SI)<span className='built-in-metrics-form-unit-option-desc'>{t('bitsSecSI')}</span>
                  </Select.Option>
                  <Select.Option value='bytesSecSI'>
                    bytes/sec(SI)<span className='built-in-metrics-form-unit-option-desc'>{t('bytesSecSI')}</span>
                  </Select.Option>
                  <Select.Option value='bitsSecIEC'>
                    bits/sec(IEC)<span className='built-in-metrics-form-unit-option-desc'>{t('bitsSecIEC')}</span>
                  </Select.Option>
                  <Select.Option value='bytesSecIEC'>
                    bytes/sec(IEC)<span className='built-in-metrics-form-unit-option-desc'>{t('bytesSecIEC')}</span>
                  </Select.Option>
                </Select.OptGroup>
                <Select.OptGroup label='Energy'>
                  <Select.Option value='dBm'>
                    Decibel-milliwatt(dBm)<span className='built-in-metrics-form-unit-option-desc'>{t('dBm')}</span>
                  </Select.Option>
                </Select.OptGroup>
                <Select.OptGroup label='Percent'>
                  <Select.Option value='percent'>
                    percent(0-100)<span className='built-in-metrics-form-unit-option-desc'>{t('percent')}</span>
                  </Select.Option>
                  <Select.Option value='percentUnit'>
                    percent(0.0-1.0)<span className='built-in-metrics-form-unit-option-desc'>{t('percentUnit')}</span>
                  </Select.Option>
                </Select.OptGroup>
                <Select.OptGroup label='Time'>
                  <Select.Option value='seconds'>
                    seconds<span className='built-in-metrics-form-unit-option-desc'>{t('seconds')}</span>
                  </Select.Option>
                  <Select.Option value='milliseconds'>
                    milliseconds<span className='built-in-metrics-form-unit-option-desc'>{t('milliseconds')}</span>
                  </Select.Option>
                </Select.OptGroup>
              </Select>
            </Form.Item>
            <Form.Item label={t('note')} name='note'>
              <Input.TextArea
                autoSize={{
                  minRows: 6,
                }}
              />
            </Form.Item>
          </Form>
        </Drawer>
      )}
    </>
  );
}
