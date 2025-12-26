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
import { Form, Card, Space } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { alphabet } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import Triggers from '@/pages/alertRules/Form/components/Triggers';

import { getDorisDatabases } from '../services';
import { NAME_SPACE } from '../constants';
import Query from './Query';

const DATASOURCE_ALL = 0;

function getFirstDatasourceId(datasourceIds: number[] = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds?.[0];
}

export default function index(props: { datasourceCate: string; datasourceValue: number[]; disabled: boolean }) {
  const { datasourceCate, datasourceValue, disabled } = props;
  const { t } = useTranslation(NAME_SPACE);
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const curDatasourceList = groupedDatasourceList[datasourceCate] || [];
  const datasourceId = getFirstDatasourceId(datasourceValue, curDatasourceList);
  const [dbList, setDbList] = useState<string[]>([]);

  useEffect(() => {
    if (!datasourceId) return;
    getDorisDatabases({ datasource_id: datasourceId, cate: datasourceCate }).then((res) => {
      setDbList(res);
    });
  }, [datasourceId, datasourceId]);

  return (
    <>
      <div className='mb-2'>
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
                  <Query key={field.key} datasourceId={datasourceId} field={field} dbList={dbList} disabled={disabled} remove={remove} />
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
