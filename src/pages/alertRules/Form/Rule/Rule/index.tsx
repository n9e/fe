import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import IntervalAndDuration from '@/pages/alertRules/Form/components/IntervalAndDuration';

import { AlertRule as TDengine } from '@/plugins/TDengine';
import { AlertRule as ClickHouse } from '@/plugins/clickHouse';
import { AlertRule as ElasticsearchSettings } from '@/plugins/elasticsearch';
import { AlertRule as MySQL } from '@/plugins/mysql';
import { AlertRule as PgSQL } from '@/plugins/pgsql';
import { AlertRule as Doris } from '@/plugins/doris';
import { AlertRule as Victorialogs } from '@/plugins/victorialogs';

// @ts-ignore
import PlusAlertRule from 'plus:/parcels/AlertRule';

import Prometheus from './Metric/Prometheus';
import Loki from './Log/Loki';
import AdvancedSettings from './Log/AdvancedSettings';

export default function index() {
  const { t } = useTranslation('alertRules');
  const cate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_value');

  return (
    <div>
      <Form.Item name='datasource_value' hidden>
        <div />
      </Form.Item>
      <Form.Item name='datasource_values' hidden>
        <div />
      </Form.Item>
      <div style={{ marginBottom: 10 }}>
        {cate === DatasourceCateEnum.prometheus && <Prometheus datasourceCate={cate} datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.tdengine && <TDengine datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.ck && <ClickHouse datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.loki && <Loki datasourceCate={cate} datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.elasticsearch && <ElasticsearchSettings disabled={false} datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.opensearch && <ElasticsearchSettings hideIndexPattern disabled={false} datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.mysql && <MySQL datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.pgsql && <PgSQL datasourceValue={datasourceValue} />}
        {cate === DatasourceCateEnum.doris && <Doris disabled={false} datasourceCate={cate} datasourceValue={[datasourceValue]} />}
        {cate === DatasourceCateEnum.victorialogs && <Victorialogs datasourceValue={[datasourceValue]} />}
        <PlusAlertRule cate={cate} datasourceValue={datasourceValue} />
      </div>

      <IntervalAndDuration
        intervalTip={(num) => {
          return t('datasource:es.alert.prom_eval_interval_tip', { num });
        }}
        durationTip={(num) => {
          return t('datasource:es.alert.prom_for_duration_tip', { num });
        }}
      />

      {/* {cate === DatasourceCateEnum.elasticsearch && <AdvancedSettings />} */}
    </div>
  );
}
