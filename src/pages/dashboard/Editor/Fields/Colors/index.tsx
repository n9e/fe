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
import { Form, Row, Col, Select, InputNumber, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { colorSchemes } from '../../../Renderer/Renderer/Heatmap/config';

export default function index() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['options', 'colors'];

  return (
    <Panel header={t('panel.options.colors.name')}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item label={t('panel.options.colors.scheme')} name={[...namePrefix, 'scheme']}>
            <Select
              options={_.map(colorSchemes, (item) => {
                return {
                  label: item.name,
                  value: item.name,
                };
              })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.options.colors.reverse')} name={[...namePrefix, 'reverse']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={8}>
          <Form.Item label={t('panel.custom.colorDomainAuto')} tooltip={t('panel.custom.colorDomainAuto_tip')} name={[...namePrefix, 'colorDomainAuto']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            if (!getFieldValue([...namePrefix, 'colorDomainAuto'])) {
              return (
                <>
                  <Col span={8}>
                    <Form.Item label='min' name={[...namePrefix, 'min']}>
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label='max' name={[...namePrefix, 'max']}>
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </>
              );
            }
          }}
        </Form.Item>
      </Row>
    </Panel>
  );
}
