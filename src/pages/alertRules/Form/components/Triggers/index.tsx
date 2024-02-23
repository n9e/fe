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
import { Form, Card, Space } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import Trigger from './Trigger';

interface IProps {
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled } = props;
  return (
    <Form.List {...prefixField} name={[...prefixName, 'triggers']}>
      {(fields, { add, remove }) => (
        <Card
          title={
            <Space>
              <span>{t('datasource:es.alert.trigger.title')}</span>
              <PlusCircleOutlined
                onClick={() =>
                  add({
                    mode: 0,
                    expressions: [
                      {
                        ref: 'A',
                        comparisonOperator: '==',
                        logicalOperator: '&&',
                      },
                    ],
                    severity: 1,
                  })
                }
              />
              <Inhibit triggersKey='triggers' />
            </Space>
          }
          size='small'
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.map((field) => {
              return (
                <div key={field.key} style={{ position: 'relative' }}>
                  <Trigger
                    prefixField={_.omit(field, 'key')}
                    fullPrefixName={[...prefixName, 'triggers', field.name]}
                    prefixName={[field.name]}
                    queries={queries}
                    disabled={disabled}
                  />
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: -4, top: -4 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </Form.List>
  );
}
