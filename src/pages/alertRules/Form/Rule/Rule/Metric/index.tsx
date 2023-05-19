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
import { Form, Row, Col, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { getAuthorizedDatasourceCates } from '@/components/AdvancedWrap';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';
import Prometheus from './Prometheus';
import { AlertRule as ClickHouse } from 'plus:/datasource/clickHouse';
import { AlertRule as Influxdb } from 'plus:/datasource/influxDB';

export default function index() {
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasourceCates = _.filter(getAuthorizedDatasourceCates(), (item) => item.type === 'metric' && !!item.alertRule);

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('common:datasource.type')} name='cate'>
            <Select>
              {_.map(datasourceCates, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
            {({ getFieldValue, setFieldsValue }) => {
              const cate = getFieldValue('cate');
              return <DatasourceValueSelect setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
            }}
          </Form.Item>
        </Col>
      </Row>
      <div style={{ marginBottom: 10 }}>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.cate, curValues.cate) || !_.isEqual(prevValues.datasource_ids, curValues.datasource_ids)}>
          {(form) => {
            const cate = form.getFieldValue('cate');
            const datasourceValue = form.getFieldValue('datasource_ids');
            if (cate === 'prometheus') {
              return <Prometheus datasourceCate={cate} datasourceValue={datasourceValue} />;
            }
            if (cate === 'ck') {
              return <ClickHouse form={form} />;
            }
            if (cate === 'influxdb') {
              return <Influxdb form={form} datasourceValue={datasourceValue} />;
            }
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
    </div>
  );
}
