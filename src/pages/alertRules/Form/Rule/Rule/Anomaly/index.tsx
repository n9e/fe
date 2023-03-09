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
import { Form, Row, Col, Select, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { PromQLInputWithBuilder } from '@/components/PromQLInput';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import Severity from '@/pages/alertRules/Form/components/Severity';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import { checkBrainPromql } from '@/services/warning';
import { FormStateContext } from '@/pages/alertRules/Form';
import { CommonStateContext } from '@/App';
import AbnormalDetection from './AbnormalDetection';
import './style.less';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds[0];
}

export default function index() {
  const { t } = useTranslation();
  const { disabled } = useContext(FormStateContext);
  const { groupedDatasourceList } = useContext(CommonStateContext);

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label='数据源类型' name='cate'>
            <Select>
              <Select.Option value='prometheus'>Prometheus</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
            {({ getFieldValue, setFieldsValue }) => {
              const cate = getFieldValue('cate');
              return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
            }}
          </Form.Item>
        </Col>
      </Row>
      <div style={{ marginBottom: 10 }}>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.datasource_ids, curValues.datasource_ids)}>
          {({ getFieldValue, setFieldsValue }) => {
            const cate = getFieldValue('cate');
            const curDatasourceList = groupedDatasourceList[cate] || [];
            const datasourceIds = getFieldValue('datasource_ids') || [];
            const datasourceId = getFirstDatasourceId(datasourceIds, curDatasourceList);

            return (
              <>
                <Form.Item name={['rule_config', 'checked']} hidden>
                  <div />
                </Form.Item>
                <Form.Item label='PromQL' required style={{ marginBottom: 0 }}>
                  <Row gutter={10}>
                    <Col flex='auto'>
                      <Form.Item name={['rule_config', 'prom_ql']} validateTrigger={['onBlur']} trigger='onChange' rules={[{ required: true, message: t('请输入PromQL') }]}>
                        <PromQLInputWithBuilder readonly={disabled} datasourceValue={datasourceId} />
                      </Form.Item>
                    </Col>
                    <Col flex='74px'>
                      <Button
                        onClick={() => {
                          const values = getFieldValue('rule_config');
                          if (values.prom_ql) {
                            setFieldsValue({
                              rule_config: {
                                ...values,
                                checked: true,
                              },
                            });
                            checkBrainPromql({
                              datasource_ids: datasourceIds,
                              algorithm: values.algorithm,
                              algo_params: values.algo_params,
                              prom_ql: values.prom_ql,
                              prom_eval_interval: values.prom_eval_interval,
                            })
                              .then(() => {
                                message.success('校验通过');
                              })
                              .catch((res) => {
                                message.error(
                                  <div>
                                    校验失败<div>{res.data.error}</div>
                                  </div>,
                                );
                              });
                          }
                        }}
                      >
                        指标校验
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
                <div>
                  <Severity
                    field={{
                      name: 'rule_config',
                    }}
                  />
                </div>
              </>
            );
          }}
        </Form.Item>
      </div>
      <AbnormalDetection />
      <IntervalAndDuration />
    </div>
  );
}
