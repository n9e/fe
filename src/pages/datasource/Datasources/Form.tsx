import React from 'react';
import { useParams } from 'react-router-dom';
import { DatasourceCateEnum } from '@/utils/constant';
import Clickhouse from '@/plugins/clickHouse/Datasource/Form';
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
  return <Plus type={params.type} {...props} />;
}
