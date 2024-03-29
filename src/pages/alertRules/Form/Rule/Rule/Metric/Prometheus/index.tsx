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

import React, { useContext } from 'react';
import { Form, Row, Col, Card, Space, Select, Tooltip, Radio } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { PromQLInputWithBuilder } from '@/components/PromQLInput';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import { FormStateContext } from '@/pages/alertRules/Form';
import { IS_PLUS } from '@/utils/constant';
import GraphPreview from './GraphPreview';
import PrometheusV2 from './PrometheusV2';
import './style.less';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds: number[] = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds?.[0];
}

export default function index(props: { form: any; datasourceCate: string; datasourceValue: number[] }) {
  const { form, datasourceCate, datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { disabled } = useContext(FormStateContext);
  const curDatasourceList = groupedDatasourceList[datasourceCate] || [];
  const datasourceId = getFirstDatasourceId(datasourceValue, curDatasourceList);
  const ruleConfigVersion = Form.useWatch(['rule_config', 'version']);

  return (
    <>
      {IS_PLUS && (
        <Form.Item
          label={
            <Space>
              {t('ruleConfigPromVersion')}
              <Tooltip
                title={
                  <Trans
                    ns='alertRules'
                    i18nKey='ruleConfigPromVersion_tip'
                    components={{
                      br: <br />,
                    }}
                  />
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          name={['rule_config', 'version']}
          initialValue='v1'
        >
          <Radio.Group
            disabled={disabled}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'v2') {
                const rule_config = form.getFieldValue('rule_config');
                form.setFieldsValue({
                  rule_config: {
                    ...rule_config,
                    triggers: [
                      {
                        mode: 0,
                        expressions: [
                          {
                            ref: 'A',
                            comparisonOperator: '>',
                            value: 0,
                            logicalOperator: '&&',
                          },
                        ],
                        severity: 2,
                      },
                    ],
                  },
                });
              }
            }}
          >
            <Radio value='v1'>{t('ruleConfigPromVersion_v1')}</Radio>
            <Radio value='v2'>{t('ruleConfigPromVersion_v2')}</Radio>
          </Radio.Group>
        </Form.Item>
      )}
      {ruleConfigVersion === 'v2' ? (
        <PrometheusV2 {...props} />
      ) : (
        <Form.List name={['rule_config', 'queries']}>
          {(fields, { add, remove }) => (
            <Card
              title={
                <Space>
                  <span>{t('metric.query.title')}</span>
                  <PlusCircleOutlined
                    onClick={() =>
                      add({
                        prom_ql: '',
                        severity: 3,
                      })
                    }
                  />
                  <Inhibit triggersKey='queries' />
                </Space>
              }
              size='small'
            >
              <div className='alert-rule-triggers-container'>
                {fields.map((field) => (
                  <div key={field.key} className='alert-rule-trigger-container'>
                    <Row>
                      <Col flex='80px'>
                        <div style={{ marginTop: 6 }}>PromQL</div>
                      </Col>
                      <Col flex='auto'>
                        <Form.Item
                          {...field}
                          name={[field.name, 'prom_ql']}
                          validateTrigger={['onBlur']}
                          trigger='onChange'
                          rules={[{ required: true, message: t('请输入PromQL') }]}
                        >
                          <PromQLInputWithBuilder readonly={disabled} datasourceValue={datasourceId} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <div>
                      <Severity field={field} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <GraphPreview form={form} fieldName={field.name} />
                    </div>
                    <MinusCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Form.List>
      )}
    </>
  );
}
