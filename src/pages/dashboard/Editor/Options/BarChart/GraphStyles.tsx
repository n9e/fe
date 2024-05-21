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
import React, { useEffect } from 'react';
import { Form, Select, Row, Col, InputNumber } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { useGlobalState } from '../../../globalState';
import { calcsOptions } from '../../config';

export default function GraphStyles() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields, setStatFields] = useGlobalState('statFields');
  const fieldsOptions = _.map(statFields, (item) => {
    return {
      label: item,
      value: item,
    };
  });

  useEffect(() => {
    return () => {
      setStatFields([]);
    };
  }, []);

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item
              label={t('panel.custom.barchart.xAxisField')}
              name={[...namePrefix, 'xAxisField']}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select options={fieldsOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('panel.custom.barchart.yAxisField')}
              name={[...namePrefix, 'yAxisField']}
              tooltip={
                <div>
                  <div>{t('panel.custom.valueField_tip2')}</div>
                  <div>{t('panel.custom.valueField_tip')}</div>
                </div>
              }
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={_.map(_.compact(_.concat(statFields, 'Value')), (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.barchart.colorField')} name={[...namePrefix, 'colorField']} tooltip={t('panel.custom.barchart.colorField_tip')}>
              <Select
                allowClear
                options={_.map(_.compact(_.concat(statFields, 'Name')), (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.calc')} name={[...namePrefix, 'calc']} tooltip={t('panel.custom.calc_tip')}>
              <Select>
                {_.map(calcsOptions, (item, key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {t(`calcs.${key}`)}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.barchart.barMaxWidth')} name={[...namePrefix, 'barMaxWidth']}>
              <InputNumber style={{ width: '100%' }} placeholder='auto' min={1} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
