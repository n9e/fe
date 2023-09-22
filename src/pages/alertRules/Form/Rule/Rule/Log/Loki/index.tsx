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
import { Form, Row, Col, Card, Space, Input } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import { FormStateContext } from '@/pages/alertRules/Form';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds: number[] = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds[0];
}

export default function index(props: { datasourceCate: string; datasourceValue: number[] }) {
  const { datasourceCate, datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { disabled } = useContext(FormStateContext);
  const curDatasourceList = groupedDatasourceList[datasourceCate] || [];
  const datasourceId = getFirstDatasourceId(datasourceValue, curDatasourceList);

  return (
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
                    <div style={{ marginTop: 6 }}>LogQL</div>
                  </Col>
                  <Col flex='auto'>
                    <Form.Item
                      {...field}
                      name={[field.name, 'prom_ql']} //页面上展示LogQL，实际还是存prom_ql
                      validateTrigger={['onBlur']}
                      trigger='onChange'
                      rules={[{ required: true, message: t('请输入LogQL') }]}
                    >
                      <Input placeholder='Input logql to query. Press Shift+Enter for newlines'></Input>
                    </Form.Item>
                  </Col>
                </Row>
                <div>
                  <Severity field={field} />
                </div>
                <MinusCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </Form.List>
  );
}
