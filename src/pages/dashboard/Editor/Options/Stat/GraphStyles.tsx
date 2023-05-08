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
import { Form, Radio, Select, Row, Col, InputNumber } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

const colSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields] = useGlobalState('statFields');
  const fields = _.compact(_.concat(statFields, 'Value'));

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('panel.custom.textMode')} name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>{t('panel.custom.valueAndName')}</Radio.Button>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='图表模式' name={[...namePrefix, 'graphMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='none'>不显示</Radio.Button>
                <Radio.Button value='area'>迷你图</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.colorMode')} name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
                <Radio.Button value='background'>{t('panel.custom.background')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item label={t('panel.custom.valueField')} name={[...namePrefix, 'valueField']}>
              <Select suffixIcon={<CaretDownOutlined />}>
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
            <Form.Item label={t('panel.custom.colSpan')} name={[...namePrefix, 'colSpan']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                {_.map(colSpans, (item) => {
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
            <Form.Item label={t('panel.custom.textSize.title')} name={[...namePrefix, 'textSize', 'title']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.textSize.value')} name={[...namePrefix, 'textSize', 'value']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
