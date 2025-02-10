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
import { useTranslation } from 'react-i18next';
import { Card, Form, Space } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { HelpLink } from '@/components/pageLayout';
import { DatasourceCateSelectV2 } from '@/components/DatasourceSelect';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';

import { panelBaseProps } from '../../constants';
import { Host, Metric, Log } from './Rule';
import { getDefaultValuesByCate } from '../utils';
// @ts-ignore
import PlusAlertRule from 'plus:/parcels/AlertRule';

export default function Rule({ form }) {
  const { t } = useTranslation('alertRules');
  const { isPlus, groupedDatasourceList, reloadGroupedDatasourceList } = useContext(CommonStateContext);
  const prod = Form.useWatch('prod');
  const cate = Form.useWatch('cate');

  return (
    <Card
      {...panelBaseProps}
      title={
        <Space>
          {t('rule_configs')}
          {prod === 'metric' && cate === 'prometheus' && (
            <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alarm-management/alert-rules/rule-configuration/metric-alarm-rule-configuration/' />
          )}
        </Space>
      }
    >
      <Form.Item name='prod' hidden />
      <Form.Item name='cate'>
        <DatasourceCateSelectV2
          filterCates={(cates) => {
            const filtedCates = _.filter(cates, (item) => {
              return !!item.alertRule && (item.alertPro ? isPlus : true);
            });
            return _.concat(filtedCates, {
              value: 'host',
              label: 'Host',
              type: ['host'],
              alertRule: true,
              alertPro: false,
              logo: '/image/logos/host.png',
            } as any);
          }}
          onChange={(val, record) => {
            const { type } = record;
            const curProd = type[0];
            form.setFieldsValue(getDefaultValuesByCate(curProd, val));
          }}
        />
      </Form.Item>
      {prod !== 'host' && <DatasourceValueSelectV2 datasourceList={groupedDatasourceList[cate] || []} reloadGroupedDatasourceList={reloadGroupedDatasourceList} showExtra />}
      <Form.Item isListField={false} name={['rule_config', 'inhibit']} valuePropName='checked' noStyle hidden>
        <div />
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.prod !== currentValues.prod}>
        {() => {
          const prod = form.getFieldValue('prod');
          if (prod === 'host') {
            return <Host />;
          }
          if (prod === 'metric') {
            return <Metric />;
          }
          if (prod === 'logging') {
            return <Log />;
          }
          return <PlusAlertRule prod={prod} form={form} />;
        }}
      </Form.Item>
    </Card>
  );
}
