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

import React, { useContext, useEffect } from 'react';
import { Form, Card, Space, Switch, Button } from 'antd';
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';

import Trigger from './Trigger';
import NodataTrigger from './NodataTrigger';
import AnomalyTrigger from './AnomalyTrigger';

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
  const { feats } = useContext(CommonStateContext);
  const { defaultActiveKey, prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled, initialValue } = props;
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);
  const cate = Form.useWatch(['cate']);
  const exp_trigger_disable = Form.useWatch([...prefixName, 'exp_trigger_disable']);
  const nodata_trigger_enable = Form.useWatch([...prefixName, 'nodata_trigger', 'enable']);
  const anomaly_trigger_enable = Form.useWatch([...prefixName, 'anomaly_trigger', 'enable']);

  return (
    <Card
      size='small'
      tabProps={{
        size: 'small',
      }}
      tabList={_.concat(
        [
          {
            key: 'triggers',
            tab: (
              <Space>
                {t('trigger.title')}
                {exp_trigger_disable === false && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)', margin: 0 }} />}
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
        ],
        cate === 'prometheus' && feats?.fcBrain === true
          ? [
              {
                key: 'anomaly_trigger',
                tab: (
                  <Space>
                    {t('anomaly_trigger.title')}
                    {anomaly_trigger_enable === true && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)' }} />}
                  </Space>
                ),
              },
            ]
          : [],
      )}
      activeTabKey={activeKey}
      onTabChange={(key) => {
        setActiveKey(key);
      }}
    >
      <div style={{ display: activeKey === 'triggers' ? 'flex' : 'none', flexDirection: 'column', gap: 10 }}>
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
              <Button
                style={{ width: '100%' }}
                type='dashed'
                icon={<PlusOutlined />}
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
              />
            </>
          )}
        </Form.List>
      </div>
      <div
        style={{
          display: activeKey === 'nodata_trigger' ? 'block' : 'none',
        }}
      >
        <NodataTrigger prefixName={prefixName} />
      </div>
      <div
        style={{
          display: activeKey === 'anomaly_trigger' ? 'block' : 'none',
        }}
      >
        <AnomalyTrigger prefixName={prefixName} active={activeKey === 'anomaly_trigger'} />
      </div>
    </Card>
  );
}
