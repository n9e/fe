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
import { Col, Form, InputNumber, Row, Select, Slider, Space, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

export default function GraphStyles() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields, setStatFields] = useGlobalState('statFields');
  const fields = _.compact(_.concat(statFields, 'Value'));
  const segments = Form.useWatch([...namePrefix, 'segments']) ?? 1;

  useEffect(() => {
    return () => {
      setStatFields([]);
    };
  }, []);

  return (
    <Panel header={t('panel.custom.title')}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item label={t('panel.custom.calc')} name={[...namePrefix, 'calc']} tooltip={t('panel.custom.calc_tip')}>
            <Select>
              {_.map(calcsOptions, (item, key) => (
                <Select.Option key={key} value={key}>
                  {t(`calcs.${key}`)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.valueField')} name={[...namePrefix, 'valueField']}>
            <Select>
              {_.map(fields, (item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.style')} name={[...namePrefix, 'style']}>
            <Select
              options={[
                { label: t('panel.custom.gauge.style_arc'), value: 'arc' },
                { label: t('panel.custom.gauge.style_circle'), value: 'circle' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.barStyle')} name={[...namePrefix, 'barStyle']}>
            <Select
              options={[
                { label: t('panel.custom.gauge.barStyle_flat'), value: 'flat' },
                { label: t('panel.custom.gauge.barStyle_rounded'), value: 'rounded' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.textMode')} name={[...namePrefix, 'textMode']}>
            <Select
              options={[
                { label: t('panel.custom.valueAndName'), value: 'valueAndName' },
                { label: t('panel.custom.value'), value: 'value' },
                { label: t('panel.custom.name'), value: 'name' },
                { label: t('panel.custom.gauge.textMode_none'), value: 'none' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.orientation')} name={[...namePrefix, 'orientation']}>
            <Select
              options={[
                { label: t('panel.custom.gauge.orientation_auto'), value: 'auto' },
                { label: t('panel.custom.gauge.orientation_horizontal'), value: 'horizontal' },
                { label: t('panel.custom.gauge.orientation_vertical'), value: 'vertical' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.barWidthFactor')} name={[...namePrefix, 'barWidthFactor']} initialValue={1}>
            <Slider min={0.1} max={1} step={0.1} marks={{ 0.1: '0.1', 1: '1' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.segments')} name={[...namePrefix, 'segments']} initialValue={1}>
            <Slider min={1} max={100} step={1} marks={{ 1: '1', 100: '100' }} />
          </Form.Item>
        </Col>
        {segments > 1 && (
          <Col span={12}>
            <Form.Item label={t('panel.custom.gauge.segmentSpacing')} name={[...namePrefix, 'segmentSpacing']} initialValue={0.16}>
              <Slider min={0} max={1} step={0.01} marks={{ 0: '0', 1: '1' }} />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item label={t('panel.custom.gauge.neutralValue')} name={[...namePrefix, 'neutralValue']} tooltip={t('panel.custom.gauge.neutralValue_tip')}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Space wrap size={18}>
            <Form.Item label={t('panel.custom.gauge.showThresholds')} name={[...namePrefix, 'showThresholds']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item label={t('panel.custom.gauge.showLabels')} name={[...namePrefix, 'showLabels']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item label={t('panel.custom.gauge.showSparkline')} name={[...namePrefix, 'showSparkline']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item label={t('panel.custom.gauge.gradient')} name={[...namePrefix, 'gradient']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item label={t('panel.custom.gauge.barGlow')} name={[...namePrefix, 'barGlow']} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item label={t('panel.custom.gauge.centerGlow')} name={[...namePrefix, 'centerGlow']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Space>
        </Col>
      </Row>
    </Panel>
  );
}
