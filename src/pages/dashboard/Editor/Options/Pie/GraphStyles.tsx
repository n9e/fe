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
import { Form, Select, Row, Col, InputNumber, Switch, Input } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions, legendPostion } from '../../config';

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.pie.legengPosition')} name={[...namePrefix, 'legengPosition']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                {legendPostion.map((item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item label={t('panel.custom.pie.max')} name={[...namePrefix, 'max']} tooltip={t('panel.custom.pie.max_tip')}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label={t('panel.custom.pie.donut')} name={[...namePrefix, 'donut']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('panel.custom.pie.labelWithName')} name={[...namePrefix, 'labelWithName']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('panel.custom.pie.labelWithValue')} name={[...namePrefix, 'labelWithValue']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item label={t('panel.custom.pie.detailName')} name={[...namePrefix, 'detailName']}>
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={15}>
            <Form.Item
              label={t('panel.custom.pie.detailUrl')}
              name={[...namePrefix, 'detailUrl']}
              tooltip={{
                overlayInnerStyle: { width: 330 },
                title: <Trans ns='dashboard' i18nKey='dashboard:link.url_tip' components={{ 1: <br /> }} />,
              }}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
