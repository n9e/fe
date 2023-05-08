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
import React, { useEffect, createContext, useContext, useState } from 'react';
import { Form, Card, Space, Button, Input, Select, Switch, Row, Col, message } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import ReactMarkdown from 'react-markdown';
import { useHistory, Link } from 'react-router-dom';
import { CommonStateContext } from '@/App';
import { processInitialValues, processFormValues } from './utils';
import { panelBaseProps } from '../constants';
import ValuesSelect from './ValuesSelect';
import Preview from './Preview';
import { getCollectCates, postCollect, putCollect } from '../services';
import { defaultValues } from '../constants';
import { CollectCateType } from '../types';

interface IProps {
  type?: number; // 空: 新增 1:编辑 2:克隆 3:查看
  initialValues?: any;
}

export const FormStateContext = createContext({
  disabled: false,
});

const queryKeyOptions = ['all_hosts', 'tags', 'hosts'];

export default function index(props: IProps) {
  const { t } = useTranslation('collects');
  const history = useHistory();
  const { busiGroups } = useContext(CommonStateContext);
  const { type, initialValues } = props;
  const [form] = Form.useForm();
  const disabled = type === 3;
  const [cates, setCate] = useState<CollectCateType[]>([]);

  useEffect(() => {
    getCollectCates().then((res) => {
      setCate(res);
    });
  }, []);

  useEffect(() => {
    if (type === 1 || type === 2 || type === 3) {
      console.log(processInitialValues(initialValues));
      form.setFieldsValue(processInitialValues(initialValues));
    } else {
      form.setFieldsValue({
        ...defaultValues,
        ...initialValues,
      });
    }
  }, [initialValues]);

  return (
    <FormStateContext.Provider
      value={{
        disabled,
      }}
    >
      <Form form={form} layout='vertical' disabled={disabled}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 10px', marginBottom: 24 }}>
          <Card {...panelBaseProps} title={t('basic_configs')}>
            <Form.Item
              name='name'
              label={t('name')}
              rules={[
                {
                  required: true,
                  message: t('name_msg'),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t('common:business_group')} name='group_id'>
              <Select showSearch optionFilterProp='children'>
                {_.map(busiGroups, (item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ marginBottom: 10 }}>
              <Space>
                <span>{t('enabled')}</span>
                <Form.Item name='enabled' valuePropName='checked' noStyle>
                  <Switch />
                </Form.Item>
              </Space>
            </div>
          </Card>
          <Form.List
            name='queries'
            rules={[
              {
                validator: async (_record, names) => {
                  if (_.isEmpty(names)) {
                    return Promise.reject(new Error(t('queries_msg')));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => {
              return (
                <Card
                  {...panelBaseProps}
                  bodyStyle={{ padding: 24 }}
                  title={
                    <Space>
                      {t('queries_configs')}
                      <PlusCircleOutlined
                        onClick={() =>
                          add({
                            key: 'tags',
                            op: '==',
                            values: [],
                          })
                        }
                      />
                    </Space>
                  }
                >
                  {fields.map((field, idx) => (
                    <div key={field.key}>
                      <Space align='baseline'>
                        {idx > 0 && <div className='alert-rule-host-condition-tips'>且</div>}
                        <Form.Item {...field} name={[field.name, 'key']} rules={[{ required: true, message: 'Missing key' }]}>
                          <Select
                            style={{ minWidth: idx > 0 ? 100 : 142 }}
                            onChange={() => {
                              const queries = form.getFieldValue(['queries']);
                              const query = queries[field.name];
                              query.values = [];
                              if (!query.op) {
                                query.op = '==';
                              }
                              if (query.key === 'all_hosts') {
                                delete query.op;
                              }
                              form.setFieldsValue({
                                queries,
                              });
                            }}
                          >
                            {queryKeyOptions.map((item) => (
                              <Select.Option key={item} value={item}>
                                {t(`query.key.${item}`)}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => {
                            const queryKey = getFieldValue(['queries', field.name, 'key']);
                            if (queryKey === 'all_hosts') return null;
                            return (
                              <Space align='baseline'>
                                <Form.Item {...field} name={[field.name, 'op']} rules={[{ required: true, message: 'Missing op' }]}>
                                  <Select style={{ minWidth: 60 }}>
                                    <Select.Option value='=='>==</Select.Option>
                                    <Select.Option value='!='>!=</Select.Option>
                                  </Select>
                                </Form.Item>
                                <ValuesSelect queryKey={queryKey} field={field} />
                              </Space>
                            );
                          }}
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(field.name)} />
                      </Space>
                    </div>
                  ))}

                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const queries = getFieldValue(['queries']);
                      return <Preview queries={queries} />;
                    }}
                  </Form.Item>
                  <Form.ErrorList errors={errors} />
                </Card>
              );
            }}
          </Form.List>
          <Card {...panelBaseProps} title={t('collect_configs')}>
            <Form.Item
              label={t('cate')}
              name='cate'
              rules={[
                {
                  required: true,
                  message: t('cate_msg'),
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp='children'
                onChange={(val) => {
                  form.setFieldsValue({
                    content: _.find(cates, { name: val })?.collect,
                  });
                }}
              >
                {_.map(cates, (item) => (
                  <Select.Option value={item.name} key={item.name}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item
                  name='content'
                  rules={[
                    {
                      required: true,
                      message: t('content_msg'),
                    },
                  ]}
                >
                  <CodeMirror
                    height='400px'
                    theme='light'
                    basicSetup
                    editable
                    extensions={[
                      EditorView.lineWrapping,
                      EditorView.theme({
                        '&': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '&.cm-editor.cm-focused': {
                          outline: 'unset',
                        },
                      }),
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue('cate');
                    const markdown = _.find(cates, { name: cate })?.markdown || '';
                    return (
                      <div
                        style={{
                          height: 400,
                          overflow: 'auto',
                        }}
                      >
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                      </div>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {!disabled && (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form
                    .validateFields()
                    .then(async (values) => {
                      const data = processFormValues(values) as any;
                      if (type === 1) {
                        putCollect(initialValues.id, {
                          ...data,
                          id: initialValues.id,
                        }).then(() => {
                          message.success(t('common:success.modify'));
                          history.push('/collects');
                        });
                      } else {
                        postCollect(data).then(() => {
                          message.success(`${type === 2 ? t('common:success.clone') : t('common:success.add')}`);
                          history.push('/collects');
                        });
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              <Link to='/collects'>
                <Button>{t('common:btn.cancel')}</Button>
              </Link>
            </Space>
          )}
        </div>
      </Form>
    </FormStateContext.Provider>
  );
}
