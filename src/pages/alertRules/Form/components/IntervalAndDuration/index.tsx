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
import { Form, Row, Col, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

interface IProps {
  intervalTip?: (value?: number) => string;
  durationTip?: (value?: number) => string;
}

export default function index({ intervalTip, durationTip }: IProps) {
  const { t } = useTranslation('alertRules');
  return (
    <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
      {({ getFieldValue }) => {
        const cate = getFieldValue('cate');
        return (
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item name='prom_eval_interval' label={t('prom_eval_interval')} tooltip={intervalTip ? intervalTip(getFieldValue('prom_eval_interval')) : undefined}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='prom_for_duration' label={t('prom_for_duration')} tooltip={durationTip ? durationTip(getFieldValue('prom_for_duration')) : undefined}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        );
      }}
    </Form.Item>
  );
}
