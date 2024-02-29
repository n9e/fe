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
import React, { useContext } from 'react';
import { Form, Input, Row, Col, Select, Switch, Button, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import IndexSelect from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/IndexSelect';
import ClusterSelect from '@/pages/dashboard/Editor/QueryEditor/components/ClusterSelect';
import { CommonStateContext } from '@/App';
import { IVariable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars, filterOptionsByReg, setVaraiableSelected, stringToRegex } from './constant';

interface IProps {
  id: string;
  range: IRawTimeRange;
  index: number;
  data: IVariable;
  vars: IVariable[];
  datasourceVars: IVariable[];
  onOk: (val: IVariable) => void;
  onCancel: () => void;
}

const typeOptions = [
  {
    label: 'Query',
    value: 'query',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
  {
    label: 'Text box',
    value: 'textbox',
  },
  {
    label: 'Constant',
    value: 'constant',
  },
  {
    label: 'Datasource',
    value: 'datasource',
  },
];

const allOptions = [
  {
    value: 'prometheus',
    label: 'Prometheus',
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
  },
];

function EditItem(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { data, vars, range, id, index, datasourceVars, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const { groupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);

  return (
    <Form layout='vertical' autoComplete='off' preserve={false} form={form} initialValues={data}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={t('var.name')} name='name' rules={[{ required: true }, { pattern: /^[0-9a-zA-Z_]+$/, message: t('var.name_msg') }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.label')} name='label'>
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.type')} name='type' rules={[{ required: true }]}>
            <Select
              style={{ width: '100%' }}
              onChange={() => {
                form.setFieldsValue({
                  definition: '',
                  defaultValue: '',
                });
              }}
            >
              {_.map(typeOptions, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            if (type !== 'constant') {
              return (
                <Col span={6}>
                  <Form.Item label={t('var.hide')} name='hide' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
              );
            }
          }}
        </Form.Item>
      </Row>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type || prevValues?.datasource?.cate !== curValues?.datasource?.cate} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          if (type === 'query') {
            return (
              <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.datasource?.cate !== curValues?.datasource?.cate} noStyle>
                {({ getFieldValue }) => {
                  const datasourceCate = getFieldValue(['datasource', 'cate']) || 'prometheus';
                  return (
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label={t('common:datasource.type')} name={['datasource', 'cate']} rules={[{ required: true }]} initialValue='prometheus'>
                          <Select
                            dropdownMatchSelectWidth={false}
                            style={{ minWidth: 70 }}
                            onChange={() => {
                              form.setFieldsValue({
                                datasource: {
                                  value: undefined,
                                },
                              });
                            }}
                          >
                            {_.map(allOptions, (item) => (
                              <Select.Option key={item.value} value={item.value}>
                                {item.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <ClusterSelect cate={datasourceCate} label={t('common:datasource.id')} name={['datasource', 'value']} datasourceVars={datasourceVars} />
                      </Col>
                      {datasourceCate === 'elasticsearch' && (
                        <>
                          <Col span={8}>
                            <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.datasource?.value !== curValues?.datasource?.value} noStyle>
                              {({ getFieldValue }) => {
                                let datasourceValue = getFieldValue(['datasource', 'value']);
                                datasourceValue = replaceExpressionVars(datasourceValue as any, vars, vars.length, id);
                                return <IndexSelect name={['config', 'index']} cate={datasourceCate} datasourceValue={datasourceValue} />;
                              }}
                            </Form.Item>
                          </Col>
                        </>
                      )}
                    </Row>
                  );
                }}
              </Form.Item>
            );
          }
        }}
      </Form.Item>

      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type || prevValues?.datasource?.cate !== curValues?.datasource?.cate} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          const datasourceCate = getFieldValue(['datasource', 'cate']) || 'prometheus';
          if (type === 'query') {
            return (
              <>
                <Form.Item
                  label={
                    <span>
                      {t('var.definition')}{' '}
                      <QuestionCircleOutlined
                        style={{ marginLeft: 5 }}
                        onClick={() => {
                          window.open('https://flashcat.cloud/media/?type=夜莺监控&source=aHR0cHM6Ly9kb3dubG9hZC5mbGFzaGNhdC5jbG91ZC9uOWUtMTMtZGFzaGJvYXJkLWludHJvLm1wNA==');
                          // if (datasourceCate === 'prometheus') {
                          //   window.open('https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable', '_blank');
                          // } else if (datasourceCate === 'elasticsearch') {
                          //   window.open('https://grafana.com/docs/grafana/latest/datasources/elasticsearch/template-variables', '_blank');
                          // }
                        }}
                      />
                    </span>
                  }
                  name='definition'
                  rules={[
                    () => ({
                      validator(_) {
                        const datasourceCate = getFieldValue(['datasource', 'cate']);
                        const definition = getFieldValue('definition');
                        if (definition) {
                          if (datasourceCate === 'elasticsearch') {
                            try {
                              JSON.parse(definition);
                              return Promise.resolve();
                            } catch (e) {
                              return Promise.reject(t('var.definition_msg2'));
                            }
                          }
                          return Promise.resolve();
                        } else {
                          return Promise.reject(new Error(t('var.definition_msg1')));
                        }
                      },
                    }),
                  ]}
                  required
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={t('var.reg')}
                  name='reg'
                  tooltip={
                    <Trans
                      ns='dashboard'
                      i18nKey='var.reg_tip'
                      components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
                    />
                  }
                  rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
                >
                  <Input placeholder='/*.hna/' />
                </Form.Item>
              </>
            );
          } else if (type === 'textbox') {
            return (
              <Form.Item label={t('var.textbox.defaultValue')} name='defaultValue'>
                <Input />
              </Form.Item>
            );
          } else if (type === 'custom') {
            return (
              <Form.Item label={t('var.custom.definition')} name='definition' rules={[{ required: true }]}>
                <Input placeholder='1,10' />
              </Form.Item>
            );
          } else if (type === 'constant') {
            return (
              <Form.Item label={t('var.constant.definition')} name='definition' tooltip={t('var.constant.defaultValue_tip')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            );
          } else if (type === 'datasource') {
            return (
              <>
                <Form.Item label={t('var.datasource.definition')} name='definition' rules={[{ required: true }]}>
                  <Select>
                    {_.map(datasourceCateOptions, (item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={t('var.datasource.regex')}
                  name='regex'
                  tooltip={
                    <Trans
                      ns='dashboard'
                      i18nKey='var.datasource.regex_tip'
                      components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
                    />
                  }
                  rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
                >
                  <Input placeholder='/vm/' />
                </Form.Item>
                <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.definition !== curValues?.regex || prevValues?.regex} noStyle>
                  {({ getFieldValue }) => {
                    const definition = getFieldValue('definition');
                    const regex = getFieldValue('regex');
                    return (
                      <Form.Item label={t('var.datasource.defaultValue')} name='defaultValue'>
                        <Select>
                          {_.map(
                            _.filter(groupedDatasourceList[definition], (item) => {
                              if (regex) {
                                const reg = stringToRegex(regex);
                                return reg ? reg.test(item.name) : false;
                              }
                              return true;
                            }),
                            (item) => (
                              <Select.Option key={item.id} value={item.id}>
                                {item.name}
                              </Select.Option>
                            ),
                          )}
                        </Select>
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </>
            );
          }
        }}
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          if (type === 'query' || type === 'custom') {
            return (
              <Row gutter={16}>
                <Col flex='120px'>
                  <Form.Item label={t('var.multi')} name='multi' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col flex='120px'>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.multi !== curValues.multi} noStyle>
                    {({ getFieldValue }) => {
                      const multi = getFieldValue('multi');
                      if (multi) {
                        return (
                          <Form.Item label={t('var.allOption')} name='allOption' valuePropName='checked'>
                            <Switch />
                          </Form.Item>
                        );
                      }
                    }}
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const multi = getFieldValue('multi');
                      const allOption = getFieldValue('allOption');
                      if (multi && allOption) {
                        return (
                          <Form.Item label={t('var.allValue')} name='allValue'>
                            <Input placeholder='.*' />
                          </Form.Item>
                        );
                      }
                    }}
                  </Form.Item>
                </Col>
              </Row>
            );
          }
        }}
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((res) => {
                onOk(res);
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
          <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EditItem;
