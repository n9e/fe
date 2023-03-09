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
import { Form, Input, InputNumber, Button, Select, Row, Col, Tooltip } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import ColorPicker from '../../../Components/ColorPicker';

interface IProps {
  preNamePrefix?: (string | number)[];
  namePrefix?: (string | number)[];
}

export default function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { preNamePrefix = [], namePrefix = ['options', 'valueMappings'] } = props;

  return (
    <Panel header={t('panel.options.valueMappings.title')}>
      <Form.List name={namePrefix}>
        {(fields, { add, remove }) => (
          <>
            <Button
              style={{ width: '100%', marginBottom: 10 }}
              onClick={() => {
                add({
                  type: 'special',
                  result: {
                    color: '#000000',
                  },
                });
              }}
            >
              {t('panel.options.valueMappings.btn')}
            </Button>
            {_.isEmpty(fields) ? null : (
              <Row gutter={10}>
                <Col flex='290px'>
                  <Tooltip
                    overlayInnerStyle={{
                      width: 300,
                    }}
                    title={
                      <Trans ns='dashboard' i18nKey='panel.options.valueMappings.type_tip'>
                        <div></div>
                        <div></div>
                      </Trans>
                    }
                  >
                    {t('panel.options.valueMappings.type')} <InfoCircleOutlined />
                  </Tooltip>
                </Col>
                <Col flex='210'>{t('panel.options.valueMappings.text')}</Col>
                <Col flex='45'>{t('panel.options.valueMappings.color')}</Col>
                <Col flex='50'>{t('panel.options.valueMappings.operations')}</Col>
              </Row>
            )}

            {fields.map(({ key, name, ...restField }) => {
              return (
                <Row key={key} gutter={10} style={{ marginBottom: 10 }}>
                  <Col flex='290px'>
                    <Row gutter={10}>
                      <Col flex='80px'>
                        <Form.Item noStyle {...restField} name={[name, 'type']}>
                          <Select suffixIcon={<CaretDownOutlined />} style={{ width: 80 }}>
                            <Select.Option value='special'>{t('panel.options.valueMappings.type_map.special')}</Select.Option>
                            <Select.Option value='range'>{t('panel.options.valueMappings.type_map.range')}</Select.Option>
                            <Select.Option value='specialValue'>{t('panel.options.valueMappings.type_map.specialValue')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col flex='1'>
                        <Form.Item noStyle {...restField} shouldUpdate>
                          {({ getFieldValue }) => {
                            const type = getFieldValue([...preNamePrefix, ...namePrefix, name, 'type']);
                            if (type === 'special') {
                              return (
                                <Form.Item noStyle {...restField} name={[name, 'match', 'special']}>
                                  <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                              );
                            }
                            if (type === 'range') {
                              return (
                                <Row gutter={10}>
                                  <Col span={12}>
                                    <Form.Item noStyle {...restField} name={[name, 'match', 'from']}>
                                      <InputNumber placeholder='from' />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item noStyle {...restField} name={[name, 'match', 'to']}>
                                      <InputNumber placeholder='to' />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              );
                            }
                            if (type === 'specialValue') {
                              return (
                                <Form.Item noStyle {...restField} name={[name, 'match', 'specialValue']}>
                                  <Select suffixIcon={<CaretDownOutlined />} style={{ width: '100%' }}>
                                    <Select.Option value='null'>Null</Select.Option>
                                    <Select.Option value='empty'>Empty string</Select.Option>
                                  </Select>
                                </Form.Item>
                              );
                            }
                            return null;
                          }}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col flex='210'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'text']}>
                      <Input placeholder={t('panel.options.valueMappings.text_placeholder')} />
                    </Form.Item>
                  </Col>
                  <Col flex='45'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'color']}>
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                  <Col flex='50'>
                    <Button
                      onClick={() => {
                        remove(name);
                      }}
                      icon={<DeleteOutlined />}
                    />
                  </Col>
                </Row>
              );
            })}
          </>
        )}
      </Form.List>
    </Panel>
  );
}
