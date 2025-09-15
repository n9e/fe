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

import React, { useState, useContext, useEffect } from 'react';
import { Form, Row, Col, Card, Space, Input, Tooltip, Select } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { alphabet, IS_PLUS } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import Triggers from '@/pages/alertRules/Form/components/Triggers';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';

import AdvancedSettings from './AdvancedSettings';
import GraphPreview from './GraphPreview';
import { getDorisDatabases } from '../services';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds: number[] = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds?.[0];
}

export default function index(props: { datasourceCate: string; datasourceValue: number[]; disabled: boolean }) {
  const { datasourceCate, datasourceValue, disabled } = props;
  const { t } = useTranslation('db_doris');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const curDatasourceList = groupedDatasourceList[datasourceCate] || [];
  const datasourceId = getFirstDatasourceId(datasourceValue, curDatasourceList);
  const [dbList, setDbList] = useState<string[]>([]);
  const queries = Form.useWatch(['rule_config', 'queries']);

  useEffect(() => {
    if (!datasourceId) return;
    getDorisDatabases({ datasource_id: datasourceId, cate: datasourceCate }).then((res) => {
      setDbList(res);
    });
  }, [datasourceId, datasourceId]);

  return (
    <>
      <div className='mb1'>
        <Form.List name={['rule_config', 'queries']}>
          {(fields, { add, remove }) => (
            <Card
              title={
                <Space>
                  <span>{t('datasource:query.title')}</span>
                  <PlusCircleOutlined
                    onClick={() =>
                      add({
                        prom_ql: '',
                        severity: 3,
                        ref: alphabet[fields.length],
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
                    <Row gutter={8} wrap={false}>
                      <Col flex='none'>
                        <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                          <QueryName existingNames={_.map(queries, 'ref')} />
                        </Form.Item>
                      </Col>
                      <Col flex='none'>
                        <InputGroupWithFormItem label={t('query.database')}>
                          <Form.Item {...field} name={[field.name, 'database']}>
                            <Select style={{ width: 200 }} placeholder={t('query.database_placeholder')} disabled={disabled}>
                              {dbList.map((db) => (
                                <Select.Option key={db} value={db}>
                                  {db}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                      <Col flex='auto'>
                        <InputGroupWithFormItem
                          label={
                            <Space>
                              SQL
                              <Tooltip title={t('query.query_tip')}>
                                <QuestionCircleOutlined />
                              </Tooltip>
                            </Space>
                          }
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, 'sql']}
                            validateTrigger={['onBlur']}
                            trigger='onChange'
                            rules={[{ required: true, message: t('datasource:query.query_required') }]}
                          >
                            <Input placeholder={t('query.query_placeholder')} disabled={disabled}></Input>
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                    </Row>
                    <AdvancedSettings prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit={IS_PLUS} />
                    <CloseCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const cate = getFieldValue('cate');
                        const sql = getFieldValue(['rule_config', 'queries', field.name, 'sql']);
                        const keys = getFieldValue(['rule_config', 'queries', field.name, 'keys']);
                        const database = getFieldValue(['rule_config', 'queries', field.name, 'database']);

                        return <GraphPreview cate={cate} datasourceValue={datasourceId} sql={sql} keys={keys} database={database} />;
                      }}
                    </Form.Item>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Form.List>
      </div>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const queries = getFieldValue(['rule_config', 'queries']);
          return <Triggers prefixName={['rule_config']} queries={queries} disabled={disabled} />;
        }}
      </Form.Item>
    </>
  );
}
