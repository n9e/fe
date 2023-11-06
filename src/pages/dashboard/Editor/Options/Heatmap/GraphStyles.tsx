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
import { Form, Select, Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { useGlobalState } from '../../../globalState';
import { colorSchemes } from '../../../Renderer/Renderer/Heatmap/config';

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields] = useGlobalState('statFields');
  const fieldsOptions = _.map(statFields, (item) => {
    return {
      label: item,
      value: item,
    };
  });

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('panel.custom.heatmap.xAxisField')} name={[...namePrefix, 'xAxisField']}>
              <Select options={fieldsOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.heatmap.yAxisField')} name={[...namePrefix, 'yAxisField']}>
              <Select options={fieldsOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.heatmap.valueField')} name={[...namePrefix, 'valueField']}>
              <Select options={fieldsOptions} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('panel.options.colors.scheme')} name={[...namePrefix, 'scheme']} initialValue='Blues'>
          <Select
            options={_.map(colorSchemes, (item) => {
              return {
                label: item.name,
                value: item.name,
              };
            })}
          />
        </Form.Item>
      </>
    </Panel>
  );
}
