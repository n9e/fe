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
import { Form, Select, Row, Col, Switch, Radio } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

export default function GraphStyles({ chartForm }) {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [tableFields] = useGlobalState('tableFields');

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.showHeader')} name={[...namePrefix, 'showHeader']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.colorMode')} name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
                <Radio.Button value='background'>{t('panel.custom.background')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('panel.custom.calc')} name={[...namePrefix, 'calc']}>
          <Select suffixIcon={<CaretDownOutlined />}>
            {_.map(calcsOptions, (item, key) => {
              return (
                <Select.Option key={key} value={key}>
                  {i18n.language === 'en_US' ? key : item.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.displayMode')} name={[...namePrefix, 'displayMode']}>
              <Select
                suffixIcon={<CaretDownOutlined />}
                onChange={(val) => {
                  if (val === 'labelsOfSeriesToRows') {
                    chartForm.setFieldsValue({ custom: { columns: [] } });
                  } else if (val === 'labelValuesToRows') {
                    chartForm.setFieldsValue({ custom: { aggrDimension: '' } });
                  }
                }}
              >
                <Select.Option value='seriesToRows'>{t('panel.custom.table.seriesToRows')}</Select.Option>
                <Select.Option value='labelsOfSeriesToRows'>{t('panel.custom.table.labelsOfSeriesToRows')}</Select.Option>
                <Select.Option value='labelValuesToRows'>{t('panel.custom.table.labelValuesToRows')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelsOfSeriesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label={t('panel.custom.table.columns')} name={[...namePrefix, 'columns']}>
                      <Select mode='multiple' placeholder='' suffixIcon={<CaretDownOutlined />}>
                        {_.map(_.concat(tableFields, 'value'), (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label={t('panel.custom.table.aggrDimension')} name={[...namePrefix, 'aggrDimension']}>
                      <Select suffixIcon={<CaretDownOutlined />}>
                        {_.map(tableFields, (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              return null;
            }}
          </Form.Item>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const displayMode = getFieldValue([...namePrefix, 'displayMode']);
                const fieldColumns = getFieldValue([...namePrefix, 'columns']);
                const columns = !_.isEmpty(fieldColumns) ? fieldColumns : _.concat(tableFields, 'value');
                const aggrDimension = getFieldValue([...namePrefix, 'aggrDimension']);
                let keys: string[] = [];
                if (displayMode === 'seriesToRows') {
                  keys = ['name', 'value'];
                } else if (displayMode === 'labelsOfSeriesToRows') {
                  keys = columns;
                } else if (displayMode === 'labelValuesToRows') {
                  keys = [aggrDimension || 'name'];
                }
                return (
                  <Form.Item label={t('panel.custom.table.sortColumn')} name={[...namePrefix, 'sortColumn']}>
                    <Select
                      suffixIcon={<CaretDownOutlined />}
                      allowClear
                      onChange={() => {
                        if (!chartForm.getFieldValue([...namePrefix, 'sortOrder'])) {
                          const customValues = chartForm.getFieldValue('custom');
                          _.set(customValues, 'sortOrder', 'ascend');
                          chartForm.setFieldsValue({
                            custom: customValues,
                          });
                        }
                      }}
                    >
                      {_.map(keys, (item) => {
                        return (
                          <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.sortOrder')} name={[...namePrefix, 'sortOrder']}>
              <Select suffixIcon={<CaretDownOutlined />} allowClear>
                <Select.Option value='ascend'>Asc</Select.Option>
                <Select.Option value='descend'>Desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
