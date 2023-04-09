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
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Form, Row, Col, Button, Space, Switch, Tooltip, Mentions } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { defaultValues, defaultCustomValuesMap } from './config';
import Options from './Options';
import Collapse, { Panel } from './Components/Collapse';
import VariableConfig, { IVariable } from '../VariableConfig';
import Renderer from '../Renderer/Renderer';
import QueryEditor from './QueryEditor';

interface IProps {
  initialValues: any;
  variableConfigWithOptions?: IVariable[];
  range: any;
  id: string;
  dashboardId: string;
}

function FormCpt(props: IProps, ref) {
  const { t } = useTranslation('dashboard');
  const [chartForm] = Form.useForm();
  const { initialValues, range, id, dashboardId } = props;
  const [variableConfigWithOptions, setVariableConfigWithOptions] = useState<IVariable[] | undefined>(props.variableConfigWithOptions);

  defaultValues.custom = defaultCustomValuesMap[initialValues?.type || defaultValues.type];

  _.forEach(initialValues.targets, (item) => {
    if (_.get(item, 'time.unit')) {
      delete item.time;
    }
  });

  useImperativeHandle(ref, () => ({
    getFormInstance: () => {
      return chartForm;
    },
  }));

  useEffect(() => {
    setVariableConfigWithOptions(props.variableConfigWithOptions);
  }, [JSON.stringify(props.variableConfigWithOptions)]);

  return (
    <Form layout='vertical' preserve={false} form={chartForm} initialValues={_.merge({}, defaultValues, initialValues)}>
      <Form.Item name='type' hidden />
      <Form.Item name='id' hidden />
      <Form.Item name='layout' hidden />
      <Form.Item name='version' hidden />
      <div
        style={{
          height: 'calc(100vh - 173px)',
        }}
      >
        <Row
          gutter={20}
          style={{
            flexWrap: 'nowrap',
            height: '100%',
          }}
        >
          <Col flex={1} style={{ minWidth: 100 }}>
            <div style={{ marginBottom: 10, height: 300 }}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldsValue }) => {
                  return <Renderer dashboardId={dashboardId} time={range} values={getFieldsValue()} variableConfig={variableConfigWithOptions} isPreview />;
                }}
              </Form.Item>
            </div>
            <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
              {({ getFieldValue }) => {
                const type = getFieldValue('type');
                if (type !== 'text' && type !== 'iframe') {
                  return (
                    <div style={{ height: 'calc(100% - 310px)', overflowY: 'auto' }}>
                      <div style={{ marginBottom: 10 }}>
                        <VariableConfig
                          onChange={(value, bool, withOptions) => {
                            setVariableConfigWithOptions(withOptions || []);
                          }}
                          value={variableConfigWithOptions}
                          editable={false}
                          range={range}
                          id={id}
                        />
                      </div>
                      <QueryEditor chartForm={chartForm} type={type} variableConfig={variableConfigWithOptions} dashboardId={dashboardId} />
                    </div>
                  );
                }
              }}
            </Form.Item>
          </Col>
          <Col flex='600px' style={{ overflowY: 'auto' }}>
            <Collapse>
              <Panel header={t('panel.base.title')}>
                <>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
                    {({ getFieldValue }) => {
                      const type = getFieldValue('type');
                      return (
                        <Form.Item
                          label={t('panel.base.name')}
                          name='name'
                          tooltip={t('panel.base.name_tip')}
                          rules={[
                            {
                              required: type === 'table',
                            },
                          ]}
                        >
                          <Mentions prefix='$' split=''>
                            {_.map(variableConfigWithOptions, (item) => {
                              return (
                                <Mentions.Option key={item.name} value={item.name}>
                                  {item.name}
                                </Mentions.Option>
                              );
                            })}
                          </Mentions>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                  <Form.Item label={t('panel.base.link.label')}>
                    <Form.List name={'links'}>
                      {(fields, { add, remove }) => (
                        <>
                          <Button
                            style={{ width: '100%', marginBottom: 10 }}
                            onClick={() => {
                              add({});
                            }}
                          >
                            {t('panel.base.link.btn')}
                          </Button>
                          {fields.map(({ key, name, ...restField }) => {
                            return (
                              <Space
                                key={key}
                                style={{
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, 'title']}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('panel.base.link.name_msg'),
                                    },
                                  ]}
                                >
                                  <Mentions prefix='$' split='' placeholder={t('panel.base.link.name')}>
                                    {_.map(variableConfigWithOptions, (item) => {
                                      return (
                                        <Mentions.Option key={item.name} value={item.name}>
                                          {item.name}
                                        </Mentions.Option>
                                      );
                                    })}
                                  </Mentions>
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'url']}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('panel.base.link.url_msg'),
                                    },
                                  ]}
                                >
                                  <Mentions prefix='$' split='' style={{ width: 260 }} placeholder={t('panel.base.link.url')}>
                                    {_.map(variableConfigWithOptions, (item) => {
                                      return (
                                        <Mentions.Option key={item.name} value={item.name}>
                                          {item.name}
                                        </Mentions.Option>
                                      );
                                    })}
                                  </Mentions>
                                </Form.Item>
                                <Tooltip title={t('panel.base.link.isNewBlank')}>
                                  <Form.Item {...restField} name={[name, 'targetBlank']} valuePropName='checked'>
                                    <Switch />
                                  </Form.Item>
                                </Tooltip>
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    remove(name);
                                  }}
                                />
                              </Space>
                            );
                          })}
                        </>
                      )}
                    </Form.List>
                    <Form.Item label={t('panel.base.description')} name='description'>
                      <Mentions prefix='$' split='' rows={3}>
                        {_.map(variableConfigWithOptions, (item) => {
                          return (
                            <Mentions.Option key={item.name} value={item.name}>
                              {item.name}
                            </Mentions.Option>
                          );
                        })}
                      </Mentions>
                    </Form.Item>
                  </Form.Item>
                </>
              </Panel>
              <Form.Item shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.targets, curValues.targets)}>
                {({ getFieldValue }) => {
                  return <Options type={getFieldValue('type')} targets={getFieldValue('targets')} chartForm={chartForm} variableConfigWithOptions={variableConfigWithOptions} />;
                }}
              </Form.Item>
            </Collapse>
          </Col>
        </Row>
      </div>
    </Form>
  );
}

export default forwardRef(FormCpt);
