import React from 'react';
import { useParams } from 'react-router-dom';
import Prometheus from './Prometheus/Form';
import ElasticSearch from './ElasticSearch/Form';
import Jaeger from './Jaeger/Form';
import AliyunSLS from './AliyunSLS/Form';
import Clickhouse from './Clickhouse/Form';
import Zabbix from './Zabbix/Form';
import Influxdb from './Influxdb/Form';

export default function Form(props) {
  const params = useParams<{ action: string; type: string }>();
  if (params.type === 'prometheus') {
    return <Prometheus {...props} />;
  }
  if (params.type === 'elasticsearch') {
    return <ElasticSearch {...props} />;
  }
  if (params.type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  if (params.type === 'aliyun-sls') {
    return <AliyunSLS {...props} />;
  }
  if (params.type === 'ck') {
    return <Clickhouse {...props} type='ck' />;
  }
  if (params.type === 'zabbix') {
    return <Zabbix {...props} />;
  }
  if (params.type === 'influxdb') {
    return <Influxdb {...props} />;
  }
  return <div>无效的数据源</div>;
}
