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
import { createPortal } from 'react-dom';
import { Form, Card, Space, Switch } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import Inhibit from '@/pages/alertRules/Form/components/Inhibit';

import Trigger from './Trigger';
import NodataTrigger from './NodataTrigger';

interface IProps {
  defaultActiveKey: string;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
  initialValue?: any;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { defaultActiveKey, prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled, initialValue } = props;
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);
  const exp_trigger_disable = Form.useWatch([...prefixName, 'exp_trigger_disable']);
  const nodata_trigger_enable = Form.useWatch([...prefixName, 'nodata_trigger', 'enable']);
  const addEleRef = React.useRef<HTMLSpanElement>(null);

  return (
    <Card
      size='small'
      tabProps={{
        size: 'small',
      }}
      tabList={[
        {
          key: 'triggers',
          tab: (
            <Space>
              {t('trigger.title')}
              {exp_trigger_disable === false && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)', margin: 0 }} />}
              <span ref={addEleRef} />
            </Space>
          ),
        },
        {
          key: 'nodata_trigger',
          tab: (
            <Space>
              {t('nodata_trigger.title')}
              {nodata_trigger_enable === true && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)' }} />}
            </Space>
          ),
        },
      ]}
      activeTabKey={activeKey}
      onTabChange={(key) => {
        setActiveKey(key);
      }}
    >
      {activeKey === 'triggers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Space>
            <Form.Item
              noStyle
              name={[...prefixName, 'exp_trigger_disable']}
              valuePropName='checked'
              getValueFromEvent={(checked) => !checked}
              getValueProps={(value) => ({ checked: !value })}
            >
              <Switch />
            </Form.Item>
            {t('trigger.exp_trigger_disable')}
          </Space>
          <Inhibit triggersKey='triggers' />
          <Form.List {...prefixField} name={[...prefixName, 'triggers']} initialValue={initialValue}>
            {(fields, { add, remove }) => (
              <>
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
                {addEleRef.current &&
                  createPortal(
                    <PlusCircleOutlined
                      onClick={() => {
                        add({
                          mode: 0,
                          expressions: [
                            {
                              ref: queries?.[0]?.ref || 'A',
                              comparisonOperator: '==',
                              logicalOperator: '&&',
                            },
                          ],
                          severity: 1,
                        });
                      }}
                    />,
                    addEleRef.current,
                  )}
              </>
            )}
          </Form.List>
        </div>
      )}
      {activeKey === 'nodata_trigger' && <NodataTrigger prefixName={prefixName} />}
    </Card>
  );
}
