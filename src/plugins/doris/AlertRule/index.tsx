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
import { Form, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { generateQueryNameByIndex } from '@/components/QueryName/utils';
import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import Triggers from '@/pages/alertRules/FormNG/components/Triggers';

import { getDorisDatabases } from '../services';
import { NAME_SPACE } from '../constants';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
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
      <div className='mb-4'>
        <Form.List name={['rule_config', 'queries']}>
          {(fields, { add, remove }) => (
            <div>
              <FormItemLabel>
                <Space>
                  {t('datasource:query.title')}
                  <Inhibit triggersKey='queries' />
                </Space>
              </FormItemLabel>
              {fields.map((field) => (
                <Query
                  key={field.key}
                  datasourceId={datasourceId}
                  field={field}
                  dbList={dbList}
                  disabled={disabled}
                  onClose={fields.length > 1 ? () => remove(field.name) : undefined}
                />
              ))}
              <Button
                className='w-full'
                type='dashed'
                onClick={() =>
                  add({
                    prom_ql: '',
                    severity: 3,
                    ref: generateQueryNameByIndex(fields.length),
                  })
                }
                icon={<PlusOutlined />}
              >
                {t('datasource:query.title')}
              </Button>
            </div>
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
