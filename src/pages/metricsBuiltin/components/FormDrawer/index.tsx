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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Col, Drawer, Form, Input, Row, Space, Button, AutoComplete, Card, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { LANGUAGE_MAP, SIZE } from '@/utils/constant';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import { getComponents, Component } from '@/pages/builtInComponents/services';

import { postMetrics, putMetric } from '../../services';
import LangSelectPopver from './LangSelectPopver';

interface Props {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'edit' | 'clone';
  title?: string;
  typesList: string[];
  collectorsList: string[];
  initialValues?: any;
  onOk: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation('metricsBuiltin');
  const { open, onOpenChange, mode, title, typesList, collectorsList, initialValues, onOk } = props;
  const [typsMeta, setTypsMeta] = useState<Component[]>([]);
  const [form] = Form.useForm();
  const translation = Form.useWatch('translation', form);
  const otherLangs = _.filter(Object.keys(LANGUAGE_MAP), (lang) => {
    return !_.find(translation, (item) => item.lang === lang);
  });

  useEffect(() => {
    getComponents({
      disabled: 0,
    }).then((res) => {
      setTypsMeta(res);
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [open]);

  return (
    <Drawer
      width='80%'
      closable={false}
      title={title}
      destroyOnClose
      extra={
        <CloseOutlined
          onClick={() => {
            onOpenChange(false);
          }}
        />
      }
      onClose={() => {
        onOpenChange(false);
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
              onOpenChange(false);
            }}
          >
            {t('common:btn.cancel')}
          </Button>
        </Space>
      }
    >
      <Form
        preserve={false}
        layout='vertical'
        form={form}
        onFinish={(values) => {
          if (mode === 'add' || mode === 'clone') {
            postMetrics([_.omit(values, ['id', 'created_at', 'created_by', 'updated_at', 'updated_by'])]).then((res) => {
              if (_.isEmpty(res)) {
                if (mode === 'add') {
                  message.success(t('common:success.add'));
                } else if (mode === 'clone') {
                  message.success(t('common:success.clone'));
                }
                form.resetFields();
                onOpenChange(false);
                onOk();
              } else {
                const msgArr = _.map(res, (value, key) => {
                  return `${key}: ${value}`;
                });
                message.error(_.join(msgArr, '; '));
              }
            });
          } else if (mode === 'edit') {
            putMetric(values).then(() => {
              message.success(t('common:success.modify'));
              form.resetFields();
              onOpenChange(false);
              onOk();
            });
          }
        }}
      >
        <Form.Item name='id' hidden>
          <div />
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
                    label: (
                      <Space>
                        <img src={_.find(typsMeta, (meta) => meta.ident === item)?.logo || '/image/default.png'} alt={item} style={{ width: 16, height: 16 }} />
                        {item}
                      </Space>
                    ),
                    value: item,
                  };
                })}
                placeholder={t('typ')}
                filterOption={(inputValue, option) => {
                  return _.includes(_.toLower(option?.value), _.toLower(inputValue));
                }}
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
                placeholder={t('collector')}
                filterOption={(inputValue, option) => {
                  return _.includes(_.toLower(option?.value), _.toLower(inputValue));
                }}
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
          <UnitPicker allowClear showSearch />
        </Form.Item>
        <Form.List
          name='translation'
          initialValue={[
            {
              lang: i18n.language,
              name: '',
              note: '',
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <Space direction='vertical' size={SIZE * 2} className='w-full'>
              <div>
                <Space size={0}>
                  {t('translation')}
                  <LangSelectPopver
                    otherLangs={otherLangs}
                    onOk={(lang) => {
                      add({
                        lang,
                        name: '',
                        note: '',
                      });
                    }}
                  />
                </Space>
              </div>
              {fields.map(({ key, name, ...restField }) => {
                const lang = form.getFieldValue(['translation', name, 'lang']);
                return (
                  <Card
                    key={key}
                    size='small'
                    title={LANGUAGE_MAP[lang] || lang}
                    extra={
                      fields.length > 1 && (
                        <CloseOutlined
                          onClick={() => {
                            if (fields.length > 1) {
                              remove(name);
                            }
                          }}
                        />
                      )
                    }
                  >
                    <Form.Item {...restField} name={[name, 'lang']} hidden>
                      <div />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'name']} label={t('name')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'note']} label={t('note')} rules={[{ required: true }]}>
                      <Input.TextArea
                        autoSize={{
                          minRows: 6,
                        }}
                      />
                    </Form.Item>
                  </Card>
                );
              })}
              <Form.ErrorList errors={errors} />
            </Space>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
}
