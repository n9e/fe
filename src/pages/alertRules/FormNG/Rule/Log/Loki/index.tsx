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
import { Form, Row, Col, Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { IS_PLUS } from '@/utils/constant';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import AdvancedSettings from '@/pages/alertRules/Form/Rule/Rule/Metric/Prometheus/components/AdvancedSettings';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';

export default function index(props: { datasourceCate: string; datasourceValue: number[] }) {
  const { t } = useTranslation('alertRules');

  return (
    <Form.List name={['rule_config', 'queries']}>
      {(fields, { add, remove }) => (
        <div>
          <FormItemLabel>
            <Space>
              {t('metric.query.title')}
              <Inhibit triggersKey='queries' />
            </Space>
          </FormItemLabel>
          {fields.map((field) => (
            <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
              <CardContainerHeader>
                <Row>
                  <Col flex='80px'>
                    <div style={{ marginTop: 6 }}>LogQL</div>
                  </Col>
                  <Col flex='auto'>
                    <Form.Item
                      {...field}
                      name={[field.name, 'prom_ql']} //页面上展示LogQL，实际还是存prom_ql
                      validateTrigger={['onBlur']}
                      trigger='onChange'
                      rules={[{ required: true, message: t('loki.required') }]}
                    >
                      <Input placeholder='Input logql to query. Press Shift+Enter for newlines'></Input>
                    </Form.Item>
                  </Col>
                </Row>
              </CardContainerHeader>
              <div className='mb-4'>
                <Severity field={field} />
              </div>
              {IS_PLUS && <AdvancedSettings field={field} />}
            </CardContainer>
          ))}
          <Button
            className='w-full'
            type='dashed'
            onClick={() =>
              add({
                prom_ql: '',
                severity: 2,
              })
            }
            icon={<PlusOutlined />}
          >
            {t('metric.query.title')}
          </Button>
        </div>
      )}
    </Form.List>
  );
}
