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

/**
 * 新版查询条件和告警条件表单
 */
import React, { useContext } from 'react';
import { Form, Row, Col, Card, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { PromQLInputWithBuilder } from '@/components/PromQLInput';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Triggers from '@/pages/alertRules/Form/components/Triggers';
import { FormStateContext } from '@/pages/alertRules/Form';
import QueryName, { generateQueryName } from '@/components/QueryName';
import GraphPreview from './GraphPreview';
import AdvancedSettings from './components/AdvancedSettings';

interface Props {
  form: any;
  datasourceValue: number;
}

export default function PrometheusV2(props: Props) {
  const { form, datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { disabled } = useContext(FormStateContext);
  const queries = Form.useWatch(['rule_config', 'queries']);

  return (
    <>
      <Form.List name={['rule_config', 'queries']}>
        {(fields, { add, remove }) => (
          <Card
            title={
              <Space>
                <span>{t('ruleConfigPromVersionV2.query.title')}</span>
                <PlusCircleOutlined
                  onClick={() =>
                    add({
                      query: '',
                    })
                  }
                />
              </Space>
            }
            size='small'
          >
            <div className='alert-rule-triggers-container'>
              {fields.map((field) => (
                <div key={field.key} className='alert-rule-trigger-container'>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                        <QueryName existingNames={_.map(queries, 'ref')} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <InputGroupWithFormItem label='PromQL'>
                        <Form.Item
                          {...field}
                          name={[field.name, 'query']}
                          validateTrigger={['onBlur']}
                          trigger='onChange'
                          rules={[{ required: true, message: t('promQLInput:required') }]}
                        >
                          <PromQLInputWithBuilder readonly={disabled} datasourceValue={datasourceValue} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    </Col>
                  </Row>
                  <AdvancedSettings field={field} />
                  <div className='mt2'>
                    <GraphPreview form={form} fieldName={field.name} promqlFieldName='query' />
                  </div>
                  <MinusCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </Form.List>
      <div style={{ marginTop: 10 }}>
        <Triggers prefixName={['rule_config']} queries={queries} disabled={disabled} />
      </div>
    </>
  );
}
