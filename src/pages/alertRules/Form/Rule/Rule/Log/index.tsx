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
import { Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { getDefaultValuesByCate } from '../../../utils';
import AdvancedSettings from './AdvancedSettings';
import Loki from './Loki';

// @ts-ignore
import PlusAlertRule from 'plus:/parcels/AlertRule';

export default function index({ form }) {
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList, datasourceCateOptions, isPlus } = useContext(CommonStateContext);
  const prod = Form.useWatch('prod');
  const cate = Form.useWatch('cate');

  return (
    <div>
      <Form.Item name='datasource_value' hidden>
        <div />
      </Form.Item>
      <Form.Item label={t('common:datasource.type')} name='cate'>
        <DatasourceCateSelect
          scene='alert'
          filterCates={(cates) => {
            return _.filter(cates, (item) => {
              return _.includes(item.type, prod) && !!item.alertRule && (item.alertPro ? isPlus : true);
            });
          }}
          onChange={(val) => {
            const cateObj = _.find(datasourceCateOptions, (item) => item.value === val);
            if (cateObj) {
              form.setFieldsValue(getDefaultValuesByCate(prod, val));
            }
          }}
        />
      </Form.Item>
      <DatasourceValueSelectV2 datasourceList={groupedDatasourceList[cate] || []} showExtra />
      <div style={{ marginBottom: 10 }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.cate, curValues.cate) || !_.isEqual(prevValues.datasource_value, curValues.datasource_value)}
        >
          {(form) => {
            const cate = form.getFieldValue('cate');
            const datasourceValue = form.getFieldValue('datasource_value');
            if (cate === 'loki') {
              return <Loki datasourceCate={cate} datasourceValue={datasourceValue} />;
            }
            return <PlusAlertRule cate={cate} form={form} datasourceValue={datasourceValue} />;
          }}
        </Form.Item>
      </div>

      <IntervalAndDuration
        intervalTip={(num) => {
          return t('datasource:es.alert.prom_eval_interval_tip', { num });
        }}
        durationTip={(num) => {
          return t('datasource:es.alert.prom_for_duration_tip', { num });
        }}
      />
      {cate !== 'loki' && <AdvancedSettings />}
    </div>
  );
}
