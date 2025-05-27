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
import React, { useEffect, useState, useImperativeHandle, forwardRef, useContext } from 'react';
import { Form, Row, Col, Button, Space, Switch, Tooltip, Mentions, Collapse as AntdCollapse, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { Dashboard } from '@/store/dashboardInterface';
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
  timezone: string;
  id: string;
  dashboardId: string;
  dashboard: Dashboard;
}

function FormCpt(props: IProps, ref) {
  const { t } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const [chartForm] = Form.useForm();
  const { initialValues, range, timezone, id, dashboardId, dashboard } = props;
  const [variableConfigWithOptions, setVariableConfigWithOptions] = useState<IVariable[] | undefined>(props.variableConfigWithOptions);
  const type = Form.useWatch('type', chartForm);
  const values = Form.useWatch([], chartForm);

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
    <Form layout='vertical' preserve={true} form={chartForm} initialValues={_.merge({}, defaultValues, initialValues)}>
      <Form.Item name='type' hidden>
        <div />
      </Form.Item>
      <Form.Item name='id' hidden>
        <div />
      </Form.Item>
      <Form.Item name='layout' hidden>
        <div />
      </Form.Item>
      <Form.Item name='version' hidden>
        <div />
      </Form.Item>
      <div
        style={{
          height: 'calc(100vh - 150px)',
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
            <div className='n9e-dashboard-editor-modal-left-wrapper n9e-gap-2'>
              {variableConfigWithOptions && variableConfigWithOptions.length > 0 && (
                <div className='n9e-dashboard-editor-modal-left-vars-wrapper n9e-gap-2'>
                  <span>{t('var.vars')}</span>
                  <VariableConfig
                    onChange={(value, bool, withOptions) => {
                      setVariableConfigWithOptions(withOptions || []);
                    }}
                    value={variableConfigWithOptions}
                    editable={false}
                    range={range}
                    id={dashboardId}
                    dashboard={dashboard}
                  />
                </div>
              )}
              <div className='n9e-border-base n9e-dashboard-editor-modal-left-chart-wrapper'>
                {values && (
                  <Renderer
                    id={id}
                    dashboardId={dashboardId}
                    dashboardID={dashboard.id}
                    time={range}
                    timezone={timezone}
                    values={values}
                    variableConfig={variableConfigWithOptions}
                    isPreview
                    themeMode={darkMode ? 'dark' : undefined}
                    annotations={[]}
                  />
                )}
              </div>
              {!_.includes(['text', 'iframe'], type) && (
                <div className='n9e-dashboard-editor-modal-left-query-wrapper'>
                  <QueryEditor chartForm={chartForm} type={type} variableConfig={variableConfigWithOptions} dashboardId={dashboardId} time={range} />
                </div>
              )}
            </div>
          </Col>
          <Col flex='600px' style={{ overflowY: 'auto' }}>
            <Collapse>
              <Panel header={t('panel.base.title')}>
                <>
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
                  <Form.Item label={t('panel.base.link.label')} style={{ marginBottom: 0 }}>
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
                                  <Mentions prefix='$' split='' style={{ width: 280 }} placeholder={t('panel.base.link.url')}>
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
                  <AntdCollapse ghost defaultActiveKey={[]}>
                    <AntdCollapse.Panel header={t('panel.base.repeatOptions.title')} key='1' forceRender>
                      <Row gutter={10}>
                        <Col span={12}>
                          <Form.Item label={t('panel.base.repeatOptions.byVariable')} name='repeat' tooltip={t('panel.base.repeatOptions.byVariableTip')}>
                            <Select allowClear>
                              {_.map(variableConfigWithOptions, (item) => {
                                return (
                                  <Select.Option key={item.name} value={item.name}>
                                    {item.name}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label={t('panel.base.repeatOptions.maxPerRow')} name='maxPerRow' initialValue={4}>
                            <Select allowClear>
                              {_.map([2, 3, 4, 6, 8, 12], (item) => {
                                return (
                                  <Select.Option key={item} value={item}>
                                    {item}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </AntdCollapse.Panel>
                  </AntdCollapse>
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
