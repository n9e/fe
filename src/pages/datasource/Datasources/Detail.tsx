import React from 'react';

import { DatasourceCateEnum } from '@/utils/constant';
import Clickhouse from '@/plugins/clickHouse/Datasource/Detail';
import Opensearch from '@/plugins/opensearch/Datasource/Detail';
import MySQL from '@/plugins/mysql/Datasource/Detail';
import PgSQL from '@/plugins/pgsql/Datasource/Detail';
import Doris from '@/plugins/doris/Datasource/Detail';

import Prometheus from './Prometheus/Detail';
import ElasticSearch from './ElasticSearch/Detail';
import Jaeger from './Jaeger/Detail';
import TDengine from './TDengine/Detail';
import Loki from './Loki/Detail';

// @ts-ignore
import Plus from 'plus:/parcels/Datasource/Detail';

export default function Form(props) {
  if (props.data.plugin_type === DatasourceCateEnum.prometheus) {
    return <Prometheus {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.elasticsearch) {
    return <ElasticSearch {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.opensearch) {
    return <Opensearch {...props} />;
  }
  if (props.data.plugin_type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.tdengine) {
    return <TDengine {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.loki) {
    return <Loki {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.ck) {
    return <Clickhouse {...props} type='ck' />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.mysql) {
    return <MySQL {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.pgsql) {
    return <PgSQL {...props} />;
  }
  if (props.data.plugin_type === DatasourceCateEnum.doris) {
    return <Doris {...props} />;
  }
  return <Plus type={props.data.plugin_type} {...props} />;
}
