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
import { Form, Radio, Select, Row, Col, InputNumber, Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

const colSpans = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields, setStatFields] = useGlobalState('statFields');
  const fields = _.compact(_.concat(statFields, 'Value'));
  const colSpan = Form.useWatch([...namePrefix, 'colSpan']);

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
            <Form.Item label={t('panel.custom.textMode')} name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>{t('panel.custom.valueAndName')}</Radio.Button>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.stat.graphMode')} name={[...namePrefix, 'graphMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='none'>{t('panel.custom.stat.none')}</Radio.Button>
                <Radio.Button value='area'>{t('panel.custom.stat.area')}</Radio.Button>
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
            <Form.Item label={t('panel.custom.colSpan')} name={[...namePrefix, 'colSpan']} tooltip={t('panel.custom.colSpanTip')}>
              <Select>
                {_.map(colSpans, (item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item === 0 ? t('panel.custom.colSpanAuto') : item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('panel.custom.textSize.title')} name={[...namePrefix, 'textSize', 'title']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.textSize.value')} name={[...namePrefix, 'textSize', 'value']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item hidden={colSpan !== 0} label={t('panel.custom.stat.orientation')} name={[...namePrefix, 'orientation']} tooltip={t('panel.custom.stat.orientationTip')}>
              <Select
                options={[
                  {
                    label: t('panel.custom.stat.orientationValueMap.auto'),
                    value: 'auto',
                  },
                  {
                    label: t('panel.custom.stat.orientationValueMap.horizontal'),
                    value: 'horizontal',
                  },
                  {
                    label: t('panel.custom.stat.orientationValueMap.vertical'),
                    value: 'vertical',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
