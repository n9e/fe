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
import { Form, Row, Col, Select, Card, Space, Radio, Input, Switch } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { getAuthorizedDatasourceCates } from '@/components/AdvancedWrap';
// import { PromQLInputWithBuilder } from '@/components/PromQLInput';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import { FormStateContext } from '@/pages/alertRules/Form';
import PromGraphMetric from '@/components/PromGraphCpt/metric';
import './style.less';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds[0];
}

export default function index() {
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { disabled } = useContext(FormStateContext);
  const datasourceCates = _.filter(getAuthorizedDatasourceCates(), (item) => item.type === 'metric');
  const severityType = {
    1:"使用自定义一级报警配置",
    2:"使用自定义二级报警配置",
    3:"使用自定义三级报警配置"
  }
  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('common:datasource.type')} name='cate'>
            <Select>
              {_.map(datasourceCates, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
            {({ getFieldValue, setFieldsValue }) => {
              const cate = getFieldValue('cate');
              return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
            }}
          </Form.Item>
        </Col>
      </Row>
      <div style={{ marginBottom: 10 }}>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.datasource_ids, curValues.datasource_ids)}>
          {({ getFieldValue }) => {
            const cate = getFieldValue('cate');
            const curDatasourceList = groupedDatasourceList[cate] || [];
            const datasourceIds = getFieldValue('datasource_ids') || [];
            const datasourceId = getFirstDatasourceId(datasourceIds, curDatasourceList);
            return (
              <Form.List name={['rule_config', 'queries']}>
                {(fields, { add, remove, }) => (
                  <Card
                    title={
                      <Space>
                        <span>{t('metric.query.title')}</span>
                        <PlusCircleOutlined
                          onClick={() =>
                            add({
                              prom_ql: '',
                              severity: 3,
                              description: "",
                              custom_notify: false,
                            })
                          }
                        />
                        <Inhibit triggersKey='queries' />
                      </Space>
                    }
                    size='small'
                  >
                    <div className='alert-rule-triggers-container'>
                      {fields.map((field,index) => (
                        <div key={field.key} className='alert-rule-trigger-container'>
                          <Row>
                            <Col flex='80px'>
                              <div style={{ marginTop: 6 }}>PromQL</div>
                            </Col>
                            <Col flex='auto'>
                              <Form.Item
                                {...field}
                                name={[field.name, 'prom_ql']}
                                validateTrigger={['onBlur']}
                                trigger='onChange'
                                valuePropName='promQL'
                                rules={[{ required: true, message: t('请输入PromQL') }]}
                              >
                                {/* <PromQLInputWithBuilder readonly={disabled} datasourceValue={datasourceId} /> */}
                                <PromGraphMetric
                                  readonly={disabled}
                                  datasourceValue={datasourceId}
                                  graphOperates={{ enabled: true }} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row>
                            <Col flex='80px'>
                              <div style={{ marginTop: 6 }}>描述</div>
                            </Col>
                            <Col flex='auto'>
                              <Form.Item {...field} name={[field.name, 'description']} noStyle>
                                <Input placeholder='支持{{}}写法，参考prometheus' />
                              </Form.Item>
                            </Col>
                          </Row>
                          <br/>
                          <div>
                            <Severity field={field} />
                          </div>
                          <Row style={{ marginTop: 8 }}>
                            <div style={{ marginTop: 8 }}>使用自定义报警配置&ensp; ：&ensp;</div>
                            <Form.Item
                              {...field}
                              name={[field.name, 'custom_notify']}
                              valuePropName="checked"
                              rules={[{ required: true, message: 'Missing 自定义通知' }]}>
                              <Switch />
                              {/* {console.log(getFieldValue('rule_config').queries[index].custom_notify)} */}
                              {/* {severityType[getFieldValue('rule_config').queries[index].severity]} */}
                            </Form.Item>
                            {/* <Form.Item shouldUpdate={(prevValues, currentValues) => {return prevValues.rule_config.queries[index] !== currentValues.rule_config.queries[index]}}>
                            {({getFieldValue}) => {
                              console.log(getFieldValue('rule_config').queries[index])
                              if(getFieldValue('rule_config').queries[index].custom_notify){
                                return (severityType[getFieldValue('rule_config').queries[index].severity])
                              } else {
                                return (<span>xxx</span>)
                              }
                            }}
                            </Form.Item> */}
                          </Row>
                          <MinusCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </Form.List>
            );
          }}
        </Form.Item>
      </div>

      <IntervalAndDuration
        intervalTip={(num) => {
          return t('metric.prom_eval_interval_tip', { num });
        }}
        durationTip={(num) => {
          return t('metric.prom_for_duration_tip', { num });
        }}
      />
    </div>
  );
}
