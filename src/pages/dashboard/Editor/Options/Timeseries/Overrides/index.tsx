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
import { Form, Space, Select, Row, Col, Radio } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../../Components/Collapse';
import StandardOptions from '../../../Fields/StandardOptions';
import { useGlobalState } from '../../../../globalState';

export default function index({ targets }) {
  const { t } = useTranslation('dashboard');
  const [tableFields] = useGlobalState('tableFields');
  const namePrefix = ['overrides'];

  return (
    <Form.List name={namePrefix}>
      {(fields, { add, remove }) =>
        fields.map(({ key, name, ...restField }) => {
          return (
            <Panel
              key={key}
              isInner
              header='Override'
              extra={
                <Space>
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        type: 'special',
                      });
                    }}
                  />
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name);
                      }}
                    />
                  )}
                </Space>
              }
            >
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item label={t('panel.overrides.matcher.id')} {...restField} name={[name, 'matcher', 'id']} initialValue='byFrameRefID'>
                    <Select
                      allowClear
                      options={[
                        {
                          label: t('panel.overrides.matcher.byFrameRefID.option'),
                          value: 'byFrameRefID',
                        },
                        // {
                        //   label: t('panel.overrides.matcher.byName.option'),
                        //   value: 'byName',
                        // },
                      ]}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const matcherID = getFieldValue([...namePrefix, name, 'matcher', 'id']);
                      if (matcherID === 'byFrameRefID') {
                        return (
                          <Form.Item label={t('panel.overrides.matcher.byFrameRefID.name')} {...restField} name={[name, 'matcher', 'value']}>
                            <Select allowClear>
                              {_.map(targets, (target) => {
                                return (
                                  <Select.Option key={target.refId} value={target.refId}>
                                    {target.refId}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        );
                      }
                      if (matcherID === 'byName') {
                        return (
                          <Form.Item label={t('panel.overrides.matcher.byName.name')} {...restField} name={[name, 'matcher', 'value']}>
                            <Select
                              allowClear
                              options={_.map(tableFields, (item) => {
                                return {
                                  label: item,
                                  value: item,
                                };
                              })}
                            />
                          </Form.Item>
                        );
                      }
                    }}
                  </Form.Item>
                </Col>
              </Row>
              {name === 0 && (
                <Panel header={t('panel.custom.timeseries.yAxis.title')}>
                  <Form.Item label={t('panel.custom.timeseries.yAxis.rightYAxis.label')} name={[name, 'properties', 'rightYAxisDisplay']} initialValue='off'>
                    <Radio.Group buttonStyle='solid'>
                      <Radio.Button value='noraml'>{t('panel.custom.timeseries.yAxis.rightYAxis.noraml')}</Radio.Button>
                      <Radio.Button value='off'>{t('panel.custom.timeseries.yAxis.rightYAxis.off')}</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Panel>
              )}
              <StandardOptions preNamePrefix={namePrefix} namePrefix={[name, 'properties', 'standardOptions']} showMinMax={false} showDisplayName />
            </Panel>
          );
        })
      }
    </Form.List>
  );
}
