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
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import AdvancedSettings from './AdvancedSettings';
import Loki from './Loki';
import { AlertRule as ElasticsearchSettings } from '@/plugins/elasticsearch';
import { AlertRule as ClickHouse } from '@/plugins/clickHouse';

// @ts-ignore
import PlusAlertRule from 'plus:/parcels/AlertRule';

export default function index() {
  const { t } = useTranslation('alertRules');
  const cate = Form.useWatch('cate');

  return (
    <div>
      <Form.Item name='datasource_value' hidden>
        <div />
      </Form.Item>
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
            if (cate === 'elasticsearch') {
              return <ElasticsearchSettings disabled={false} form={form} datasourceValue={datasourceValue} />;
            }
            if (cate === 'ck') {
              return <ClickHouse datasourceValue={datasourceValue} />;
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
