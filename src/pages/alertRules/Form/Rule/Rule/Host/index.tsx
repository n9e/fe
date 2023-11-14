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

import React from 'react';
import _ from 'lodash';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Form, InputNumber, Space, Select, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import ValuesSelect from './ValuesSelect';
import Preview from './Preview';
import './style.less';

const queryKeyOptions = [{ value: 'all_hosts' }, { value: 'group_ids' }, { value: 'tags' }, { value: 'hosts' }];
const triggerTypeOptions = [{ value: 'target_miss' }, { value: 'pct_target_miss' }, { value: 'offset' }];

export default function index() {
  const { t } = useTranslation('alertRules');
  const form = Form.useFormInstance();

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Form.List name={['rule_config', 'queries']}>
          {(fields, { add, remove }) => (
            <Card
              title={
                <Space>
                  <span>{t('host.query.title')}</span>
                  <PlusCircleOutlined
                    onClick={() =>
                      add({
                        key: 'group_ids',
                        op: '==',
                        values: [],
                      })
                    }
                  />
                </Space>
              }
              size='small'
            >
              {fields.map((field, idx) => (
                <div key={field.key}>
                  <Space align='baseline'>
                    {idx > 0 && <div className='alert-rule-host-condition-tips'>且</div>}
                    <Form.Item {...field} name={[field.name, 'key']} rules={[{ required: true, message: 'Missing key' }]}>
                      <Select
                        style={{ minWidth: idx > 0 ? 100 : 142 }}
                        onChange={() => {
                          const queries = form.getFieldValue(['rule_config', 'queries']);
                          const query = queries[field.name];
                          query.values = [];
                          form.setFieldsValue({
                            rule_config: {
                              queries,
                            },
                          });
                        }}
                      >
                        {queryKeyOptions.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {t(`host.query.key.${item.value}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue, setFieldsValue }) => {
                        const queryKey = getFieldValue(['rule_config', 'queries', field.name, 'key']);
                        const queryOp = getFieldValue(['rule_config', 'queries', field.name, 'op']);
                        if (queryKey === 'all_hosts') return null;
                        return (
                          <Space align='baseline'>
                            <Form.Item {...field} name={[field.name, 'op']} rules={[{ required: true, message: 'Missing op' }]}>
                              <Select
                                style={{ minWidth: 60 }}
                                options={_.concat(
                                  [
                                    {
                                      value: '==',
                                      label: '==',
                                    },
                                    {
                                      value: '!=',
                                      label: '!=',
                                    },
                                  ],
                                  queryKey === 'hosts'
                                    ? [
                                        {
                                          value: '=~',
                                          label: '=~',
                                        },
                                        {
                                          value: '!~',
                                          label: '!~',
                                        },
                                      ]
                                    : [],
                                )}
                                onChange={(val) => {
                                  const queries = getFieldValue(['rule_config', 'queries']);
                                  const query = queries[field.name];
                                  query.values = undefined;
                                  setFieldsValue({
                                    rule_config: {
                                      queries,
                                    },
                                  });
                                }}
                              />
                            </Form.Item>
                            <ValuesSelect queryKey={queryKey} queryOp={queryOp} field={field} />
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
                  const queries = getFieldValue(['rule_config', 'queries']);
                  return <Preview queries={queries} />;
                }}
              </Form.Item>
            </Card>
          )}
        </Form.List>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Form.List name={['rule_config', 'triggers']}>
          {(fields, { add, remove }) => (
            <Card
              title={
                <Space>
                  <span>{t('host.trigger.title')}</span>
                  <PlusCircleOutlined
                    onClick={() =>
                      add({
                        type: 'target_miss',
                        severity: 3,
                        duration: 30,
                      })
                    }
                  />
                  <Inhibit triggersKey='triggers' />
                </Space>
              }
              size='small'
            >
              <div className='alert-rule-triggers-container'>
                {fields.map((field) => (
                  <div key={field.key} className='alert-rule-trigger-container'>
                    <Space align='baseline'>
                      <Form.Item {...field} name={[field.name, 'type']} rules={[{ required: true, message: 'Missing type' }]}>
                        <Select
                          style={{ minWidth: 120 }}
                          onChange={(val) => {
                            const triggers = form.getFieldValue(['rule_config', 'triggers']);
                            const trigger = triggers[field.name];
                            if (val === 'target_miss') {
                              trigger.duration = 30;
                            } else if (val === 'offset') {
                              trigger.duration = 500;
                            } else {
                              trigger.duration = 30;
                            }
                            console.log(triggers);
                            form.setFieldsValue({
                              rule_config: {
                                triggers: triggers,
                              },
                            });
                          }}
                        >
                          {triggerTypeOptions.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {t(`host.trigger.key.${item.value}`)}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <span>{t('host.trigger.than')}</span>
                      <Form.Item {...field} name={[field.name, 'duration']} rules={[{ required: true, message: 'Missing duration' }]}>
                        <InputNumber style={{ width: 80 }} min={1} step={1} />
                      </Form.Item>
                      <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const type = getFieldValue(['rule_config', 'triggers', field.name, 'type']);
                          return (
                            <Space align='baseline'>
                              <span>
                                {type === 'pct_target_miss' ? t('host.trigger.pct_target_miss_text') : type === 'offset' ? t('host.trigger.millisecond') : t('host.trigger.second')}
                              </span>
                              {type === 'pct_target_miss' && (
                                <>
                                  <Form.Item {...field} name={[field.name, 'percent']} rules={[{ required: true, message: 'Missing percent' }]}>
                                    <InputNumber style={{ width: 80 }} min={1} max={100} step={1} />
                                  </Form.Item>
                                  <span>%</span>
                                </>
                              )}
                            </Space>
                          );
                        }}
                      </Form.Item>
                    </Space>
                    <div>
                      <Severity field={field} />
                    </div>
                    <MinusCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Form.List>
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
