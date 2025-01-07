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
import { Form, Select, Row, Col, InputNumber, Input, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

export default function GraphStyles() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields, setStatFields] = useGlobalState('statFields');
  const fields = _.compact(_.concat(statFields, 'Value'));
  const combine_other = Form.useWatch([...namePrefix, 'combine_other']);

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
          <Col span={8}>
            <Form.Item label={t('panel.custom.valueField')} name={[...namePrefix, 'valueField']} tooltip={t('panel.custom.valueField_tip')}>
              <Select>
                {_.map(fields, (item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.nameField')} name={[...namePrefix, 'nameField']} tooltip={t('panel.custom.nameField_tip')}>
              <Select allowClear>
                {_.map(statFields, (item) => {
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
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.serieWidth')}>
              <Input.Group>
                <Form.Item noStyle name={[...namePrefix, 'serieWidth']}>
                  <InputNumber style={{ width: '100%' }} placeholder='auto' />
                </Form.Item>
                <span className='ant-input-group-addon'>%</span>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.sortOrder')} name={[...namePrefix, 'sortOrder']}>
              <Select>
                <Select.Option value='none'>None</Select.Option>
                <Select.Option value='asc'>Asc</Select.Option>
                <Select.Option value='desc'>Desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.barGauge.displayMode')} name={[...namePrefix, 'displayMode']}>
              <Select>
                <Select.Option value='basic'>Basic</Select.Option>
                <Select.Option value='lcd'>Retro LCD</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.barGauge.valueMode.label')} name={[...namePrefix, 'valueMode']}>
              <Select>
                <Select.Option value='color'>{t('panel.custom.barGauge.valueMode.color')}</Select.Option>
                <Select.Option value='hidden'>{t('panel.custom.barGauge.valueMode.hidden')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.barGauge.topn')} name={[...namePrefix, 'topn']}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('panel.custom.barGauge.combine_other')}
              tooltip={t('panel.custom.barGauge.combine_other_tip')}
              name={[...namePrefix, 'combine_other']}
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('panel.custom.barGauge.otherPosition.label')}
              tooltip={t('panel.custom.barGauge.otherPosition.tip')}
              name={[...namePrefix, 'otherPosition']}
              initialValue='none'
              hidden={!combine_other}
            >
              <Select
                options={[
                  {
                    label: t('panel.custom.barGauge.otherPosition.options.none'),
                    value: 'none',
                  },
                  {
                    label: t('panel.custom.barGauge.otherPosition.options.top'),
                    value: 'top',
                  },
                  {
                    label: t('panel.custom.barGauge.otherPosition.options.bottom'),
                    value: 'bottom',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              label={t('panel.custom.detailUrl')}
              name={[...namePrefix, 'detailUrl']}
              tooltip={{
                overlayInnerStyle: { width: 330 },
                title: <Trans ns='dashboard' i18nKey='dashboard:var.help_tip' components={{ 1: <br /> }} />,
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
