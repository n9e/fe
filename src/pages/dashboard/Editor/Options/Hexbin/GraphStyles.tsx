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
import { Form, Radio, Select, Row, Col, InputNumber, Switch, Input } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import ColorPicker from '../../../Components/ColorPicker';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { colors } from '../../../Components/ColorRangeMenu/config';
import '../../../Components/ColorRangeMenu/style.less';

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const colorRange = Form.useWatch([...namePrefix, 'colorRange']);

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={10}>
            <Form.Item label={t('panel.custom.textMode')} name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>{t('panel.custom.valueAndName')}</Radio.Button>
                <Radio.Button value='name'>{t('panel.custom.name')}</Radio.Button>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label={t('panel.custom.fontBackground')} name={[...namePrefix, 'fontBackground']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={10}>
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
          <Col span={7}>
            <Form.Item label={t('panel.custom.colorRange')} name={[...namePrefix, 'colorRange']}>
              <Select suffixIcon={<CaretDownOutlined />} dropdownClassName='color-scales' optionLabelProp='label'>
                {_.map(colors, (item) => {
                  return (
                    <Select.Option key={item.label} label={item.label} value={_.join(item.value, ',')}>
                      <span className='color-scales-menu-colors'>
                        {item.type === 'palette' &&
                          _.map(item.value, (color) => {
                            return (
                              <span
                                key={color}
                                style={{
                                  backgroundColor: color,
                                }}
                              />
                            );
                          })}
                      </span>
                      {item.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          {colorRange !== 'thresholds' && (
            <Col span={7}>
              <Form.Item label={t('panel.custom.reverseColorOrder')} name={[...namePrefix, 'reverseColorOrder']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          )}
        </Row>
        {colorRange !== 'thresholds' && (
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item
                label={t('panel.custom.colorDomainAuto')}
                tooltip={t('panel.custom.colorDomainAuto_tip')}
                name={[...namePrefix, 'colorDomainAuto']}
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                if (!getFieldValue([...namePrefix, 'colorDomainAuto'])) {
                  return (
                    <>
                      <Col span={8}>
                        <Form.Item label='min' name={[...namePrefix, 'colorDomain', 0]}>
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label='max' name={[...namePrefix, 'colorDomain', 1]}>
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </>
                  );
                }
              }}
            </Form.Item>
          </Row>
        )}
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              label={t('panel.custom.detailUrl')}
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
