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

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Triggers from '@/pages/alertRules/Form/components/Triggers';
import { FormStateContext } from '@/pages/alertRules/Form';
import QueryName, { generateQueryName } from '@/components/QueryName';
import PromQLInputNG from '@/components/PromQLInputNG';

import GraphPreview from './GraphPreview';
import AdvancedSettings from './components/AdvancedSettings';

interface Props {
  datasourceValue: number;
}

export default function PrometheusV2(props: Props) {
  const { datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { disabled } = useContext(FormStateContext);
  const form = Form.useFormInstance();
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
                  onClick={() => {
                    return add({
                      ref: generateQueryName(_.map(queries, 'ref')),
                      query: '',
                    });
                  }}
                />
              </Space>
            }
            size='small'
          >
            <div className='alert-rule-triggers-container'>
              {fields.map((field) => (
                <div key={field.key} className='alert-rule-trigger-container'>
                  <div className='flex gap-[8px]'>
                    <div className='flex-shrink-0'>
                      <Form.Item {...field} name={[field.name, 'ref']}>
                        <QueryName existingNames={_.map(queries, 'ref')} />
                      </Form.Item>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <InputGroupWithFormItem label='PromQL'>
                        <Form.Item
                          {...field}
                          name={[field.name, 'query']}
                          validateTrigger={['onBlur']}
                          trigger='onChange'
                          rules={[{ required: true, message: t('promQLInput:required') }]}
                        >
                          <PromQLInputNG readOnly={disabled} datasourceValue={datasourceValue} durationVariablesCompletion={false} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    </div>
                  </div>
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
