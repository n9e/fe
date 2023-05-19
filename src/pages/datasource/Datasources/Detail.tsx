import React from 'react';
import Prometheus from './Prometheus/Detail';
import ElasticSearch from './ElasticSearch/Detail';
import Jaeger from './Jaeger/Detail';
import Clickhouse from './Clickhouse/Detail';
import AliyunSLS from './AliyunSLS/Detail';
import Zabbix from './Zabbix/Detail';
import Influxdb from './Influxdb/Detail';

export default function Form(props) {
  if (props.data.plugin_type === 'prometheus') {
    return <Prometheus {...props} />;
  }
  if (props.data.plugin_type === 'elasticsearch') {
    return <ElasticSearch {...props} />;
  }
  if (props.data.plugin_type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  if (props.data.plugin_type === 'ck') {
    return <Clickhouse {...props} type='ck' />;
  }
  if (props.data.plugin_type === 'aliyun-sls') {
    return <AliyunSLS {...props} />;
  }
  if (props.data.plugin_type === 'zabbix') {
    return <Zabbix {...props} />;
  }
  if (props.data.plugin_type === 'influxdb') {
    return <Influxdb {...props} />;
  }
  return <div>无效的数据源</div>;
}
