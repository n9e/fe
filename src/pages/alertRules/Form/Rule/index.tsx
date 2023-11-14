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
import { Card, Form } from 'antd';
import { getBrainParams } from '@/services/warning';
import { CommonStateContext } from '@/App';
import { panelBaseProps } from '../../constants';
import { Host, Metric, Log } from './Rule';
import { getDefaultValuesByProd } from '../utils';
import ProdSelect from '../components/ProdSelect';
// @ts-ignore
import PlusAlertRule from 'plus:/parcels/AlertRule';

export default function Rule({ form }) {  
  const { t } = useTranslation('alertRules');
  const { isPlus } = useContext(CommonStateContext);

  return (
    <Card {...panelBaseProps} title={t('rule_configs')}>
      <ProdSelect
        onChange={(prod) => {
          if (prod === 'anomaly') {
            // 获取默认 brain 参数，用于初始化智能告警的设置
            form.setFieldsValue({
              prod: 'anomaly',
            });
            getBrainParams().then((res) => {
              form.setFieldsValue(getDefaultValuesByProd(prod, res));
            });
          } else {
            form.setFieldsValue(getDefaultValuesByProd(prod, {}, isPlus));
          }
        }}
      />
      <Form.Item isListField={false} name={['rule_config', 'inhibit']} valuePropName='checked' noStyle hidden>
        <div />
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.prod !== currentValues.prod}>
        {() => {
          const prod = form.getFieldValue('prod');
          const cate = form.getFieldValue('cate');
          if (prod === 'host') {
            return <Host />;
          }
          if (prod === 'metric') {
            return <Metric form={form} />;
          }
          if (prod === 'logging') {
            return <Log form={form} />;
          }
          return <PlusAlertRule prod={prod} form={form} />;
        }}
      </Form.Item>
    </Card>
  );
}
