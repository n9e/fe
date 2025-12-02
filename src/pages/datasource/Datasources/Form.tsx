import React from 'react';
import { useParams } from 'react-router-dom';

import { DatasourceCateEnum } from '@/utils/constant';
import Clickhouse from '@/plugins/clickHouse/Datasource/Form';
import Opensearch from '@/plugins/opensearch/Datasource/Form';
import MySQL from '@/plugins/mysql/Datasource/Form';
import PgSQL from '@/plugins/pgsql/Datasource/Form';
import Doris from '@/plugins/doris/Datasource/Form';
import Victorialogs from '@/plugins/victorialogs/Datasource/Form';

import Prometheus from './Prometheus/Form';
import ElasticSearch from './ElasticSearch/Form';
import Jaeger from './Jaeger/Form';
import TDengine from './TDengine/Form';
import Loki from './Loki/Form';
// @ts-ignore
import Plus from 'plus:/parcels/Datasource/Form';

export default function Form(props) {
  const params = useParams<{ action: string; type: string }>();
  if (params.type === DatasourceCateEnum.prometheus) {
    return <Prometheus {...props} />;
  }
  if (params.type === DatasourceCateEnum.elasticsearch) {
    return <ElasticSearch {...props} />;
  }
  if (params.type === DatasourceCateEnum.opensearch) {
    return <Opensearch {...props} />;
  }
  if (params.type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  if (params.type === DatasourceCateEnum.tdengine) {
    return <TDengine {...props} />;
  }
  if (params.type === DatasourceCateEnum.loki) {
    return <Loki {...props} />;
  }
  if (params.type === DatasourceCateEnum.ck) {
    return <Clickhouse {...props} type='ck' />;
  }
  if (params.type === DatasourceCateEnum.mysql) {
    return <MySQL {...props} />;
  }
  if (params.type === DatasourceCateEnum.pgsql) {
    return <PgSQL {...props} />;
  }
  if (params.type === DatasourceCateEnum.doris) {
    return <Doris {...props} />;
  }
  if (params.type === DatasourceCateEnum.victorialogs) {
    return <Victorialogs {...props} />;
  }
  return <Plus type={params.type} {...props} />;
}
